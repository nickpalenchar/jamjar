-- AlterTable
ALTER TABLE "QueueSongs" ADD COLUMN     "spotifyUri" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;
