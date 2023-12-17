-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "jamId" TEXT NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_id_key" ON "Worker"("id");

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
