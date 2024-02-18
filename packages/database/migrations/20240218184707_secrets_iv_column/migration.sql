/*
  Warnings:

  - Added the required column `iv` to the `Secrets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Secrets" ADD COLUMN     "iv" BYTEA NOT NULL;
