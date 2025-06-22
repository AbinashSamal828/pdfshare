import dotenv from "dotenv";
dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import pdfRoutes from "./routes/pdf";
import commentRoutes from "./routes/comments";
import publicRoutes from "./routes/public";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/pdf", pdfRoutes);
app.use("/comments", commentRoutes);
app.use("/public", publicRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
