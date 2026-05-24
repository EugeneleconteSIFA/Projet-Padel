-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'CLUB');

-- CreateEnum
CREATE TYPE "PostMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'FIRE', 'CLAP');

-- CreateEnum
CREATE TYPE "ForumCategory" AS ENUM ('PARTENAIRE', 'MATERIEL', 'TECHNIQUE', 'CLUBS_TERRAINS', 'REGLES_ARBITRAGE', 'PETITES_ANNONCES', 'ORGANISATION');

-- CreateEnum
CREATE TYPE "FriendlyMatchStatus" AS ENUM ('OPEN', 'FULL', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('POST', 'COMMENT', 'FORUM_THREAD', 'FORUM_REPLY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN');

-- AlterEnum
ALTER TYPE "NotificationKind" ADD VALUE 'POST_REACTION';
ALTER TYPE "NotificationKind" ADD VALUE 'POST_COMMENT';
ALTER TYPE "NotificationKind" ADD VALUE 'NEW_FOLLOWER';
ALTER TYPE "NotificationKind" ADD VALUE 'FRIENDLY_MATCH_JOINED';
ALTER TYPE "NotificationKind" ADD VALUE 'FRIENDLY_MATCH_FULL';
ALTER TYPE "NotificationKind" ADD VALUE 'CLUB_PROMOTED_POST';
ALTER TYPE "NotificationKind" ADD VALUE 'FORUM_REPLY_RECEIVED';

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN "hasCompletedTournament" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "clubId" TEXT,
    "tournamentId" TEXT,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "mediaType" "PostMediaType" NOT NULL DEFAULT 'IMAGE',
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubPromotedPost" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "activeFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubPromotedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL,
    "category" "ForumCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendlyMatch" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "clubId" TEXT,
    "city" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "levelMin" TEXT,
    "levelMax" TEXT,
    "spotsTotal" INTEGER NOT NULL,
    "spotsLeft" INTEGER NOT NULL,
    "description" TEXT,
    "status" "FriendlyMatchStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendlyMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendlyMatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendlyMatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_clubId_idx" ON "Post"("clubId");

-- CreateIndex
CREATE INDEX "Post_visibility_createdAt_idx" ON "Post"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "Post_isPromoted_idx" ON "Post"("isPromoted");

-- CreateIndex
CREATE INDEX "PostReaction_postId_idx" ON "PostReaction"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_authorId_type_key" ON "PostReaction"("postId", "authorId", "type");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubPromotedPost_postId_key" ON "ClubPromotedPost"("postId");

-- CreateIndex
CREATE INDEX "ClubPromotedPost_clubId_activeUntil_idx" ON "ClubPromotedPost"("clubId", "activeUntil");

-- CreateIndex
CREATE INDEX "ForumThread_category_createdAt_idx" ON "ForumThread"("category", "createdAt");

-- CreateIndex
CREATE INDEX "ForumThread_isPinned_idx" ON "ForumThread"("isPinned");

-- CreateIndex
CREATE INDEX "ForumReply_threadId_votes_idx" ON "ForumReply"("threadId", "votes");

-- CreateIndex
CREATE INDEX "FriendlyMatch_city_date_idx" ON "FriendlyMatch"("city", "date");

-- CreateIndex
CREATE INDEX "FriendlyMatch_status_date_idx" ON "FriendlyMatch"("status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FriendlyMatchParticipant_matchId_playerProfileId_key" ON "FriendlyMatchParticipant"("matchId", "playerProfileId");

-- CreateIndex
CREATE INDEX "Report_targetType_status_idx" ON "Report"("targetType", "status");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- Full-text search on forum thread titles (French)
CREATE INDEX "forum_thread_fts_idx" ON "ForumThread" USING GIN (to_tsvector('french', "title"));

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPromotedPost" ADD CONSTRAINT "ClubPromotedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPromotedPost" ADD CONSTRAINT "ClubPromotedPost_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ForumReply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendlyMatch" ADD CONSTRAINT "FriendlyMatch_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendlyMatch" ADD CONSTRAINT "FriendlyMatch_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendlyMatchParticipant" ADD CONSTRAINT "FriendlyMatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "FriendlyMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendlyMatchParticipant" ADD CONSTRAINT "FriendlyMatchParticipant_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
