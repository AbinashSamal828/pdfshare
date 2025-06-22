import express, { NextFunction, Request, Response } from "express";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({ region: process.env.AWS_REGION! });

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
}

router.post(
  "/upload",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const { filename, contentType } = req.body;
    const fileKey = `${req.userId}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({ uploadUrl, s3Url });
  }
);
router.post("/save", authenticate, async (req: AuthRequest, res) => {
  const { filename, s3Url } = req.body;
  await prisma.pdf.create({
    data: {
      filename,
      s3Url,
      ownerId: req.userId!,
    },
  });
  res.status(201).json({ message: "PDF saved successfully" });
});
router.get("/pdfs", authenticate, async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      pdf: true,
      sharedPdfs: true,
    },
  });
  res.json({ ownedPdfs: user?.pdf, sharedPdfs: user?.sharedPdfs });
});
router.get("/", (req, res) => {
  res.json({ message: "working properly" });
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const pdf = await prisma.pdf.findUnique({
    where: { id },
  });
  if (!pdf) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }

  res.json(pdf);
});

router.get("/:id/view-url", authenticate, async (req: any, res) => {
  const { id } = req.params;
  const pdf = await prisma.pdf.findUnique({ where: { id } });
  if (!pdf) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }
  const fileKey = pdf.s3Url.split(".amazonaws.com/")[1];
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  res.json({ url: signedUrl, filename: pdf.filename, ownerId: pdf.ownerId });
});

router.post("/:id/share", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: pdfId } = req.params;
    const { email } = req.body;

    // 1. Find the user to share with by their email
    const userToShareWith = await prisma.user.findUnique({ where: { email } });

    // 2. Check if the user exists
    if (!userToShareWith) {
      res.status(404).json({ message: "User with that email not found." });
      return;
    }

    // (Optional but good practice) Prevent sharing with the owner
    const pdf = await prisma.pdf.findUnique({ where: { id: pdfId } });
    if (pdf?.ownerId === userToShareWith.id) {
      res.status(400).json({ message: "This user already owns the PDF." });
      return;
    }

    // 3. Update the PDF to add the user to the `sharedWith` relation
    await prisma.pdf.update({
      where: { id: pdfId },
      data: {
        sharedWith: {
          connect: {
            id: userToShareWith.id, // Connect using the user's ID
          },
        },
      },
    });

    // 4. Send a success response
    res.status(200).json({ message: `PDF successfully shared with ${email}.` });
  } catch (error) {
    console.error("Failed to share PDF:", error);
    res
      .status(500)
      .json({ message: "An error occurred while sharing the PDF." });
  }
});

router.post(
  "/:id/generate-share-link",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const pdf = await prisma.pdf.findUnique({
        where: { id, ownerId: req.userId },
      });

      if (!pdf) {
        res
          .status(404)
          .json({ message: "PDF not found or you are not the owner." });
        return;
      }

      let { shareToken } = pdf;
      if (!shareToken) {
        shareToken = uuidv4();
        await prisma.pdf.update({
          where: { id },
          data: { shareToken },
        });
      }

      const shareLink = `${process.env.FRONTEND_URL}/share/${shareToken}`;
      res.json({ shareLink });
    } catch (error) {
      console.error("Error generating share link:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

export default router;
