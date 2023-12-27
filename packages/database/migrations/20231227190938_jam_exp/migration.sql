/*
  Warnings:

  - Added the required column `exp` to the `Jam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Jam" ADD COLUMN     "exp" TIMESTAMP(3) NOT NULL;
