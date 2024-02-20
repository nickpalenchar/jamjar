-- CreateTable
CREATE TABLE "WorkerTask" (
    "id" SERIAL NOT NULL,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,
    "task_name" TEXT NOT NULL,
    "exp" TIMESTAMP(3),

    CONSTRAINT "WorkerTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerLocks" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "issued_to" TEXT NOT NULL,
    "exp" TIMESTAMP(3),

    CONSTRAINT "WorkerLocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerTask_id_key" ON "WorkerTask"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerLocks_id_key" ON "WorkerLocks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerLocks_key_key" ON "WorkerLocks"("key");
