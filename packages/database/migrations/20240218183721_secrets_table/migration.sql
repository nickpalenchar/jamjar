-- CreateTable
CREATE TABLE "Secrets" (
    "id" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "encryptedValue" TEXT NOT NULL,

    CONSTRAINT "Secrets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Secrets_id_key" ON "Secrets"("id");
