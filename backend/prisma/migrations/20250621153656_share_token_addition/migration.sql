/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Pdf` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pdf" ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pdf_shareToken_key" ON "Pdf"("shareToken");
