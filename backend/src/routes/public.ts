import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const prisma = new PrismaClient();
const s3Client = new S3Client({ region: process.env.AWS_REGION! });

// GET PDF details via share token
router.get("/pdf/:shareToken", async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    const pdf = await prisma.pdf.findUnique({ where: { shareToken } });

    if (!pdf) {
      res.status(404).json({ message: "Shared PDF not found." });
      return;
    }

    const key = pdf.s3Url.split(".amazonaws.com/")[1];
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    res.json({ url: signedUrl, filename: pdf.filename });
  } catch (error) {
    console.error("Error fetching shared PDF:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET comments for a shared PDF
router.get("/comments/:shareToken", async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    const pdf = await prisma.pdf.findUnique({
      where: { shareToken },
      include: {
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!pdf) {
      res.status(404).json({ message: "PDF not found." });
      return;
    }
    res.json(pdf.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// POST a new guest comment
router.post("/comments/:shareToken", async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    const { text, guestName } = req.body;

    if (!text || !guestName) {
      res
        .status(400)
        .json({ message: "Comment text and guest name are required." });
      return;
    }

    const pdf = await prisma.pdf.findUnique({ where: { shareToken } });
    if (!pdf) {
      res.status(404).json({ message: "PDF not found." });
      return;
    }

    const newComment = await prisma.comment.create({
      data: {
        pdfId: pdf.id,
        text,
        guestName,
        pageNumber: 1, // Default page number
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
