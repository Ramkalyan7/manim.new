/*
  Warnings:

  - You are about to drop the column `sceneId` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the `Scene` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `video` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Prompt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_sceneId_fkey";

-- DropForeignKey
ALTER TABLE "Scene" DROP CONSTRAINT "Scene_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "video" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "sceneId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Scene";

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
