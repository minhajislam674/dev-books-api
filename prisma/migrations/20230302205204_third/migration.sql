/*
  Warnings:

  - You are about to drop the column `authorId` on the `Book` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_authorId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "authorId";

-- CreateTable
CREATE TABLE "_book_authors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_book_authors_AB_unique" ON "_book_authors"("A", "B");

-- CreateIndex
CREATE INDEX "_book_authors_B_index" ON "_book_authors"("B");

-- AddForeignKey
ALTER TABLE "_book_authors" ADD CONSTRAINT "_book_authors_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_book_authors" ADD CONSTRAINT "_book_authors_B_fkey" FOREIGN KEY ("B") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
