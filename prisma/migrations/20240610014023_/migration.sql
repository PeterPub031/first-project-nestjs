/*
  Warnings:

  - You are about to drop the column `email_verify_token` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_verify_token";
