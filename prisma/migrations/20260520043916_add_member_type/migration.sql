-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('NORMAL', 'WAR');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "memberType" "MemberType" NOT NULL DEFAULT 'NORMAL';
