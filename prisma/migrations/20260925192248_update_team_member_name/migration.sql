/*
  Warnings:

  - You are about to drop the column `firstName` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `team_members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "team_members" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "name" TEXT;
