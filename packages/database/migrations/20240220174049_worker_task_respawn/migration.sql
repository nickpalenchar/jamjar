-- AlterTable
ALTER TABLE "WorkerTask" ADD COLUMN     "not_before" TIMESTAMP(3),
ADD COLUMN     "respawn" INTEGER;
