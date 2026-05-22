-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ClubProfile" ADD COLUMN "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "RefereeProfile" ADD COLUMN "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'PENDING';
