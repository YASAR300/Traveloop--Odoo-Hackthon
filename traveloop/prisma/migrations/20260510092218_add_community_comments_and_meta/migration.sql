-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('TRAVEL', 'HOTEL', 'FOOD', 'ACTIVITY', 'GENERAL');

-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN     "commentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "destination" TEXT;

-- AlterTable
ALTER TABLE "sections" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "isPlanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sectionType" "SectionType" NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE "community_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_cities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_activities_userId_activityId_key" ON "saved_activities"("userId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_cities_userId_cityId_key" ON "saved_cities"("userId", "cityId");

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_activities" ADD CONSTRAINT "saved_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_activities" ADD CONSTRAINT "saved_activities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cities" ADD CONSTRAINT "saved_cities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cities" ADD CONSTRAINT "saved_cities_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
