-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "telegramPostedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "IngestedItem" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "articleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngestedItem_sourceUrl_key" ON "IngestedItem"("sourceUrl");

-- CreateIndex
CREATE INDEX "IngestedItem_createdAt_idx" ON "IngestedItem"("createdAt");
