-- CreateTable
CREATE TABLE "UserInJam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jamId" TEXT NOT NULL,
    "vibes" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "UserInJam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInJam_id_key" ON "UserInJam"("id");

-- AddForeignKey
ALTER TABLE "UserInJam" ADD CONSTRAINT "UserInJam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInJam" ADD CONSTRAINT "UserInJam_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
