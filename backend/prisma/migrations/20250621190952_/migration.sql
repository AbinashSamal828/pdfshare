-- CreateTable
CREATE TABLE "_SharedPdfs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedPdfs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SharedPdfs_B_index" ON "_SharedPdfs"("B");

-- AddForeignKey
ALTER TABLE "_SharedPdfs" ADD CONSTRAINT "_SharedPdfs_A_fkey" FOREIGN KEY ("A") REFERENCES "Pdf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedPdfs" ADD CONSTRAINT "_SharedPdfs_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
