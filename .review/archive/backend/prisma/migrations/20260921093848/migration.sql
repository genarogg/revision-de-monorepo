/*
  Warnings:

  - The `rol` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `Bitacora` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccionesBitacora" AS ENUM ('LOGIN', 'CREATE_ADMIN', 'CREATE_USER', 'UPDATE_ADMIN', 'UPDATE_USER', 'DELETE_ADMIN', 'DELETE_USER', 'VIEW', 'ERROR', 'GET_USUARIOS');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'EDITOR', 'READER');

-- AlterTable
ALTER TABLE "Bitacora" DROP COLUMN "type",
ADD COLUMN     "type" "AccionesBitacora" NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "rol",
ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'READER';
