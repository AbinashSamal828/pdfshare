import { NextFunction, Response, Request } from "express";
import { verifyToken } from "../utils/auth";

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "no token provided" });
    return;
  }
  try {
    const decodedToken = verifyToken(token) as any;
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    next(err);
  }
};
