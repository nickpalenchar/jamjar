-- CreateTable
CREATE TABLE "SpotifyState" (
    "id" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SpotifyState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyState_id_key" ON "SpotifyState"("id");
