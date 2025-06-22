import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";

const prisma = new PrismaClient();
const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { pdfId, pageNumber, text } = req.body;
  const comment = await prisma.comment.create({
    data: {
      pdfId,
      pageNumber,
      text,
      userId: req.userId,
    },
  });
  res.json(comment);
});
router.get("/:id/comments", authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const pdf = await prisma.pdf.findFirst({
    where: { id },
    include: {
      comments: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(pdf?.comments);
});
router.post("/:id/comment", authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.userId;
  if (!text) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  const comment = await prisma.comment.create({
    data: {
      pdfId: id,
      userId,
      text,
      pageNumber: 1,
    },
  });
  res.status(201).json(comment);
});

export default router;
