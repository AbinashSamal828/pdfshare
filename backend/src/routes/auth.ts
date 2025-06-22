import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/auth";

const router = express.Router();
const prisma = new PrismaClient();

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      const token = generateToken(user.id);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json("Invalid Credentials");
        return;
      }
      const token = generateToken(user.id);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
