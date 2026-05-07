/*
  Warnings:

  - You are about to drop the column `autorId` on the `Anotacion` table. All the data in the column will be lost.
  - The `estado` column on the `Anotacion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `bio` on the `Artista` table. All the data in the column will be lost.
  - You are about to drop the column `esVerificado` on the `Artista` table. All the data in the column will be lost.
  - You are about to drop the column `paisOrigen` on the `Artista` table. All the data in the column will be lost.
  - You are about to drop the column `seguidores` on the `Artista` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyUrl` on the `Artista` table. All the data in the column will be lost.
  - You are about to drop the column `albumId` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `bpm` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `danceability` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `duracion` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `energy` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `popularity` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyUrl` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `trackNumber` on the `Cancion` table. All the data in the column will be lost.
  - You are about to drop the column `valence` on the `Cancion` table. All the data in the column will be lost.
  - The primary key for the `Creador` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Favorito` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotifyId` on the `Favorito` table. All the data in the column will be lost.
  - The primary key for the `Jerga` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cancionId` on the `Jerga` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Letra` table. All the data in the column will be lost.
  - The `estado` column on the `Letra` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `aciertosTotales` on the `PartidaDiaria` table. All the data in the column will be lost.
  - You are about to drop the column `intentosTotales` on the `PartidaDiaria` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PistaQuavedle` table. All the data in the column will be lost.
  - You are about to drop the column `imagenUrl` on the `PistaQuavedle` table. All the data in the column will be lost.
  - You are about to drop the column `pistaDuracion` on the `PistaQuavedle` table. All the data in the column will be lost.
  - You are about to drop the column `pistaLetraInicio` on the `PistaQuavedle` table. All the data in the column will be lost.
  - You are about to drop the column `pistaNumeroTrack` on the `PistaQuavedle` table. All the data in the column will be lost.
  - You are about to drop the column `pistaProductor` on the `PistaQuavedle` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyId` on the `PistaQuavedle` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PistaQuavedle` table. All the data in the column will be lost.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alias` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Usuario` table. All the data in the column will be lost.
  - The `rol` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CancionArtista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comentario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EstadisticaUsuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Logro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PistaVersoOculto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistColaborador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Seguimiento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeleccionDiaria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsuarioLogro` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuarioId,tipo,itemId]` on the table `Favorito` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Anotacion` table without a default value. This is not possible if the table is not empty.
  - Made the column `popularidad` on table `Artista` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `itemId` to the `Favorito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshot` to the `Favorito` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo` on the `Favorito` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo` on the `PistaQuavedle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `passwordHash` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_artistaId_fkey";

-- DropForeignKey
ALTER TABLE "Anotacion" DROP CONSTRAINT "Anotacion_autorId_fkey";

-- DropForeignKey
ALTER TABLE "Anotacion" DROP CONSTRAINT "Anotacion_cancionId_fkey";

-- DropForeignKey
ALTER TABLE "Cancion" DROP CONSTRAINT "Cancion_albumId_fkey";

-- DropForeignKey
ALTER TABLE "CancionArtista" DROP CONSTRAINT "CancionArtista_artistaId_fkey";

-- DropForeignKey
ALTER TABLE "CancionArtista" DROP CONSTRAINT "CancionArtista_cancionId_fkey";

-- DropForeignKey
ALTER TABLE "Comentario" DROP CONSTRAINT "Comentario_padreId_fkey";

-- DropForeignKey
ALTER TABLE "Comentario" DROP CONSTRAINT "Comentario_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "EstadisticaUsuario" DROP CONSTRAINT "EstadisticaUsuario_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Favorito" DROP CONSTRAINT "Favorito_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Jerga" DROP CONSTRAINT "Jerga_cancionId_fkey";

-- DropForeignKey
ALTER TABLE "Letra" DROP CONSTRAINT "Letra_cancionId_fkey";

-- DropForeignKey
ALTER TABLE "PistaVersoOculto" DROP CONSTRAINT "PistaVersoOculto_cancionId_fkey";

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_creadorId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistColaborador" DROP CONSTRAINT "PlaylistColaborador_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistColaborador" DROP CONSTRAINT "PlaylistColaborador_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_addedById_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Seguimiento" DROP CONSTRAINT "Seguimiento_seguidorId_fkey";

-- DropForeignKey
ALTER TABLE "Seguimiento" DROP CONSTRAINT "Seguimiento_siguiendoId_fkey";

-- DropForeignKey
ALTER TABLE "UsuarioLogro" DROP CONSTRAINT "UsuarioLogro_logroId_fkey";

-- DropForeignKey
ALTER TABLE "UsuarioLogro" DROP CONSTRAINT "UsuarioLogro_usuarioId_fkey";

-- DropIndex
DROP INDEX "Anotacion_autorId_idx";

-- DropIndex
DROP INDEX "Anotacion_cancionId_idx";

-- DropIndex
DROP INDEX "Anotacion_estado_idx";

-- DropIndex
DROP INDEX "Artista_nombre_idx";

-- DropIndex
DROP INDEX "Artista_popularidad_idx";

-- DropIndex
DROP INDEX "Cancion_albumId_idx";

-- DropIndex
DROP INDEX "Cancion_nombre_idx";

-- DropIndex
DROP INDEX "Creador_alias_key";

-- DropIndex
DROP INDEX "Favorito_usuarioId_spotifyId_tipo_key";

-- DropIndex
DROP INDEX "Jerga_termino_key";

-- DropIndex
DROP INDEX "PartidaDiaria_fecha_idx";

-- DropIndex
DROP INDEX "PistaQuavedle_dificultad_idx";

-- DropIndex
DROP INDEX "PistaQuavedle_tipo_idx";

-- DropIndex
DROP INDEX "PistaQuavedle_usadaEnDiario_idx";

-- DropIndex
DROP INDEX "Usuario_alias_key";

-- AlterTable
ALTER TABLE "Anotacion" DROP COLUMN "autorId",
ADD COLUMN     "usuarioId" TEXT NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "Artista" DROP COLUMN "bio",
DROP COLUMN "esVerificado",
DROP COLUMN "paisOrigen",
DROP COLUMN "seguidores",
DROP COLUMN "spotifyUrl",
ADD COLUMN     "biografia" TEXT,
ALTER COLUMN "popularidad" SET NOT NULL,
ALTER COLUMN "popularidad" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Cancion" DROP COLUMN "albumId",
DROP COLUMN "bpm",
DROP COLUMN "danceability",
DROP COLUMN "duracion",
DROP COLUMN "energy",
DROP COLUMN "explicit",
DROP COLUMN "key",
DROP COLUMN "popularity",
DROP COLUMN "spotifyUrl",
DROP COLUMN "trackNumber",
DROP COLUMN "valence",
ADD COLUMN     "duracionMs" INTEGER,
ADD COLUMN     "imagen" TEXT,
ADD COLUMN     "popularidad" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Creador" DROP CONSTRAINT "Creador_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Creador_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Creador_id_seq";

-- AlterTable
ALTER TABLE "Favorito" DROP CONSTRAINT "Favorito_pkey",
DROP COLUMN "spotifyId",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "snapshot" JSONB NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "usuarioId" SET DATA TYPE TEXT,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Favorito_id_seq";

-- AlterTable
ALTER TABLE "Jerga" DROP CONSTRAINT "Jerga_pkey",
DROP COLUMN "cancionId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Jerga_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Jerga_id_seq";

-- AlterTable
ALTER TABLE "Letra" DROP COLUMN "createdAt",
ALTER COLUMN "fuente" DROP NOT NULL,
ALTER COLUMN "fuente" DROP DEFAULT,
DROP COLUMN "estado",
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "PartidaDiaria" DROP COLUMN "aciertosTotales",
DROP COLUMN "intentosTotales";

-- AlterTable
ALTER TABLE "PistaQuavedle" DROP COLUMN "createdAt",
DROP COLUMN "imagenUrl",
DROP COLUMN "pistaDuracion",
DROP COLUMN "pistaLetraInicio",
DROP COLUMN "pistaNumeroTrack",
DROP COLUMN "pistaProductor",
DROP COLUMN "spotifyId",
DROP COLUMN "updatedAt",
DROP COLUMN "tipo",
ADD COLUMN     "tipo" TEXT NOT NULL,
ALTER COLUMN "artista" DROP NOT NULL,
ALTER COLUMN "pistaAnio" SET DATA TYPE TEXT,
ALTER COLUMN "dificultad" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "alias",
DROP COLUMN "fechaNacimiento",
DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "quavePoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "rol",
ADD COLUMN     "rol" TEXT NOT NULL DEFAULT 'USER',
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Usuario_id_seq";

-- DropTable
DROP TABLE "Album";

-- DropTable
DROP TABLE "CancionArtista";

-- DropTable
DROP TABLE "Comentario";

-- DropTable
DROP TABLE "EstadisticaUsuario";

-- DropTable
DROP TABLE "Logro";

-- DropTable
DROP TABLE "PistaVersoOculto";

-- DropTable
DROP TABLE "Playlist";

-- DropTable
DROP TABLE "PlaylistColaborador";

-- DropTable
DROP TABLE "PlaylistItem";

-- DropTable
DROP TABLE "Rating";

-- DropTable
DROP TABLE "Seguimiento";

-- DropTable
DROP TABLE "SeleccionDiaria";

-- DropTable
DROP TABLE "UsuarioLogro";

-- DropEnum
DROP TYPE "EstadoAnotacion";

-- DropEnum
DROP TYPE "EstadoLetra";

-- DropEnum
DROP TYPE "Rol";

-- DropEnum
DROP TYPE "RolColaborador";

-- DropEnum
DROP TYPE "TipoAlbum";

-- DropEnum
DROP TYPE "TipoFavorito";

-- DropEnum
DROP TYPE "TipoJuego";

-- DropEnum
DROP TYPE "TipoLogro";

-- DropEnum
DROP TYPE "TipoPista";

-- CreateTable
CREATE TABLE "HistorialPuntos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialPuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoJuego" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "juego" TEXT NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "metadatos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultadoJuego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valoracion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Valoracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancionesOnArtistas" (
    "cancionId" TEXT NOT NULL,
    "artistaId" TEXT NOT NULL,

    CONSTRAINT "CancionesOnArtistas_pkey" PRIMARY KEY ("cancionId","artistaId")
);

-- CreateTable
CREATE TABLE "Escena" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ciudadPrincipal" TEXT NOT NULL,
    "sellos" TEXT[],
    "generos" TEXT[],
    "establecidos" TEXT[],
    "mujeres" TEXT[],
    "productores" TEXT[],
    "influencias" TEXT[],
    "exportacion" TEXT[],
    "festivales" TEXT[],
    "venues" TEXT[],
    "evolucion" JSONB,
    "colaboraciones" JSONB,
    "datosCuriosos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escena_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Valoracion_usuarioId_tipo_itemId_key" ON "Valoracion"("usuarioId", "tipo", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Escena_slug_key" ON "Escena"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_usuarioId_tipo_itemId_key" ON "Favorito"("usuarioId", "tipo", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- AddForeignKey
ALTER TABLE "HistorialPuntos" ADD CONSTRAINT "HistorialPuntos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoJuego" ADD CONSTRAINT "ResultadoJuego_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Letra" ADD CONSTRAINT "Letra_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancionesOnArtistas" ADD CONSTRAINT "CancionesOnArtistas_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancionesOnArtistas" ADD CONSTRAINT "CancionesOnArtistas_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
