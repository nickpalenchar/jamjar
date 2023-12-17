/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `anon` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "anon" BOOLEAN NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jam" (
    "id" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotify" JSONB NOT NULL,

    CONSTRAINT "Jam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueSongs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jamId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 5,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "QueueSongs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Jam_id_key" ON "Jam"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Jam_phrase_key" ON "Jam"("phrase");

-- CreateIndex
CREATE UNIQUE INDEX "QueueSongs_id_key" ON "QueueSongs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jam" ADD CONSTRAINT "Jam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueSongs" ADD CONSTRAINT "QueueSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueSongs" ADD CONSTRAINT "QueueSongs_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
