/*
  Warnings:

  - You are about to drop the column `spotifyPlaylistUri` on the `Jam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Jam" DROP COLUMN "spotifyPlaylistUri",
ADD COLUMN     "spotifyPlaylistId" TEXT;
