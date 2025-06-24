-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('info', 'success', 'warning', 'error');

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "allowUserRegistration" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "announcementType" "AnnouncementType" NOT NULL DEFAULT 'info',
ADD COLUMN     "defaultUserRole" "accountrole" NOT NULL DEFAULT 'MEMBER';
