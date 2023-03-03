/*
  Warnings:

  - You are about to drop the column `genreId` on the `Book` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_genreId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "genreId";

-- CreateTable
CREATE TABLE "_book_genres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_book_genres_AB_unique" ON "_book_genres"("A", "B");

-- CreateIndex
CREATE INDEX "_book_genres_B_index" ON "_book_genres"("B");

-- AddForeignKey
ALTER TABLE "_book_genres" ADD CONSTRAINT "_book_genres_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_book_genres" ADD CONSTRAINT "_book_genres_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
