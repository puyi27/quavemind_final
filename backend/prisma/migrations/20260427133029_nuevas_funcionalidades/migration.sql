-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MODERADOR', 'USUARIO', 'ARTISTA_VERIFICADO');

-- CreateEnum
CREATE TYPE "TipoFavorito" AS ENUM ('CANCION', 'ARTISTA', 'ALBUM');

-- CreateEnum
CREATE TYPE "TipoAlbum" AS ENUM ('ALBUM', 'SINGLE', 'EP', 'COMPILATION');

-- CreateEnum
CREATE TYPE "EstadoLetra" AS ENUM ('PENDIENTE', 'VERIFICADA', 'COMPLETA', 'INCOMPLETA');

-- CreateEnum
CREATE TYPE "EstadoAnotacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'DESTACADA');

-- CreateEnum
CREATE TYPE "TipoPista" AS ENUM ('ALBUM', 'CANCION', 'ARTISTA', 'COVER');

-- CreateEnum
CREATE TYPE "TipoJuego" AS ENUM ('QUAVEDLE_ALBUM', 'QUAVEDLE_CANCION', 'QUAVEDLE_ARTISTA', 'QUAVEDLE_COVER', 'VERSO_OCULTO', 'CADENA_TEMAS');

-- CreateEnum
CREATE TYPE "TipoLogro" AS ENUM ('ANOTACIONES_CREADAS', 'ANOTACIONES_APROBADAS', 'ANOTACIONES_DESTACADAS', 'JUEGOS_GANADOS', 'RACHA_PERFECTA', 'DIAS_CONSECUTIVOS', 'CANCIONES_IMPORTADAS');

-- CreateEnum
CREATE TYPE "RolColaborador" AS ENUM ('EDITOR', 'VISUALIZADOR');

-- CreateTable
CREATE TABLE "Creador" (
    "id" SERIAL NOT NULL,
    "alias" TEXT NOT NULL,
    "rolPrincipal" TEXT NOT NULL,
    "biografia" TEXT,
    "barrioOrigen" TEXT,

    CONSTRAINT "Creador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jerga" (
    "id" SERIAL NOT NULL,
    "termino" TEXT NOT NULL,
    "significado" TEXT NOT NULL,
    "contexto" TEXT,
    "origen" TEXT,
    "cancionId" TEXT,

    CONSTRAINT "Jerga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "alias" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "ubicacion" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "rol" "Rol" NOT NULL DEFAULT 'USUARIO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seguimiento" (
    "id" SERIAL NOT NULL,
    "seguidorId" INTEGER NOT NULL,
    "siguiendoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "tipo" "TipoFavorito" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artista" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "imagen" TEXT,
    "seguidores" INTEGER,
    "generos" TEXT[],
    "popularidad" INTEGER,
    "spotifyUrl" TEXT,
    "bio" TEXT,
    "paisOrigen" TEXT,
    "esVerificado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "imagen" TEXT,
    "fecha" TEXT,
    "totalTracks" INTEGER,
    "label" TEXT,
    "spotifyUrl" TEXT,
    "artistaId" TEXT NOT NULL,
    "tipo" "TipoAlbum" NOT NULL DEFAULT 'ALBUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cancion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "duracion" INTEGER,
    "previewUrl" TEXT,
    "spotifyUrl" TEXT,
    "trackNumber" INTEGER,
    "albumId" TEXT,
    "bpm" DOUBLE PRECISION,
    "key" INTEGER,
    "energy" DOUBLE PRECISION,
    "danceability" DOUBLE PRECISION,
    "valence" DOUBLE PRECISION,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cancion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancionArtista" (
    "id" TEXT NOT NULL,
    "cancionId" TEXT NOT NULL,
    "artistaId" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CancionArtista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Letra" (
    "id" TEXT NOT NULL,
    "cancionId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "fuente" TEXT NOT NULL DEFAULT 'genius',
    "urlFuente" TEXT,
    "estado" "EstadoLetra" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Letra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anotacion" (
    "id" TEXT NOT NULL,
    "cancionId" TEXT NOT NULL,
    "autorId" INTEGER NOT NULL,
    "inicio" INTEGER NOT NULL,
    "fin" INTEGER NOT NULL,
    "textoSeleccionado" TEXT NOT NULL,
    "titulo" TEXT,
    "contenido" TEXT NOT NULL,
    "votosPositivos" INTEGER NOT NULL DEFAULT 0,
    "votosNegativos" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoAnotacion" NOT NULL DEFAULT 'PENDIENTE',
    "artistaMencionadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anotacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PistaQuavedle" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPista" NOT NULL,
    "respuesta" TEXT NOT NULL,
    "artista" TEXT NOT NULL,
    "respuestasAceptadas" TEXT[],
    "pistaAnio" INTEGER,
    "pistaGenero" TEXT,
    "pistaAlbum" TEXT,
    "pistaCanciones" TEXT[],
    "pistaColaboradores" TEXT[],
    "pistaLetraInicio" TEXT,
    "pistaDuracion" TEXT,
    "pistaNumeroTrack" INTEGER,
    "pistaProductor" TEXT,
    "pistaAdjetivos" TEXT[],
    "dificultad" INTEGER NOT NULL DEFAULT 3,
    "usadaEnDiario" TIMESTAMP(3),
    "vecesJugada" INTEGER NOT NULL DEFAULT 0,
    "aciertos" INTEGER NOT NULL DEFAULT 0,
    "fallos" INTEGER NOT NULL DEFAULT 0,
    "imagenUrl" TEXT,
    "spotifyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PistaQuavedle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartidaDiaria" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "pistaId" TEXT NOT NULL,
    "intentosTotales" INTEGER NOT NULL DEFAULT 0,
    "aciertosTotales" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PartidaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadisticaUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipoJuego" "TipoJuego" NOT NULL,
    "jugadas" INTEGER NOT NULL DEFAULT 0,
    "aciertos" INTEGER NOT NULL DEFAULT 0,
    "rachaActual" INTEGER NOT NULL DEFAULT 0,
    "mejorRacha" INTEGER NOT NULL DEFAULT 0,
    "ultimaJugada" TIMESTAMP(3),

    CONSTRAINT "EstadisticaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logro" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT,
    "tipo" "TipoLogro" NOT NULL,
    "requisito" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioLogro" (
    "id" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "logroId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioLogro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PistaVersoOculto" (
    "id" TEXT NOT NULL,
    "cancionId" TEXT NOT NULL,
    "verso" TEXT NOT NULL,
    "inicioVerso" INTEGER NOT NULL,
    "finVerso" INTEGER NOT NULL,
    "pistaArtista" TEXT,
    "pistaAnio" INTEGER,
    "pistaAlbum" TEXT,
    "dificultad" INTEGER NOT NULL DEFAULT 3,
    "usadaEnDiario" TIMESTAMP(3),
    "vecesJugada" INTEGER NOT NULL DEFAULT 0,
    "aciertos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PistaVersoOculto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeleccionDiaria" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "artistaDestacadoId" TEXT,
    "descubrimientoUnderId" TEXT,
    "cancionDelDiaId" TEXT,
    "albumDelDiaId" TEXT,
    "versoDelDiaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeleccionDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "esPublica" BOOLEAN NOT NULL DEFAULT true,
    "esColaborativa" BOOLEAN NOT NULL DEFAULT false,
    "creadorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistItem" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "tipo" "TipoFavorito" NOT NULL,
    "orden" INTEGER NOT NULL,
    "addedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistColaborador" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rol" "RolColaborador" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistColaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "tipo" "TipoFavorito" NOT NULL,
    "valor" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "tipo" "TipoFavorito" NOT NULL,
    "contenido" TEXT NOT NULL,
    "padreId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creador_alias_key" ON "Creador"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "Jerga_termino_key" ON "Jerga"("termino");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_alias_key" ON "Usuario"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seguimiento_seguidorId_siguiendoId_key" ON "Seguimiento"("seguidorId", "siguiendoId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_usuarioId_spotifyId_tipo_key" ON "Favorito"("usuarioId", "spotifyId", "tipo");

-- CreateIndex
CREATE INDEX "Artista_nombre_idx" ON "Artista"("nombre");

-- CreateIndex
CREATE INDEX "Artista_popularidad_idx" ON "Artista"("popularidad");

-- CreateIndex
CREATE INDEX "Album_artistaId_idx" ON "Album"("artistaId");

-- CreateIndex
CREATE INDEX "Album_fecha_idx" ON "Album"("fecha");

-- CreateIndex
CREATE INDEX "Cancion_albumId_idx" ON "Cancion"("albumId");

-- CreateIndex
CREATE INDEX "Cancion_nombre_idx" ON "Cancion"("nombre");

-- CreateIndex
CREATE INDEX "CancionArtista_artistaId_idx" ON "CancionArtista"("artistaId");

-- CreateIndex
CREATE UNIQUE INDEX "CancionArtista_cancionId_artistaId_key" ON "CancionArtista"("cancionId", "artistaId");

-- CreateIndex
CREATE UNIQUE INDEX "Letra_cancionId_key" ON "Letra"("cancionId");

-- CreateIndex
CREATE INDEX "Anotacion_cancionId_idx" ON "Anotacion"("cancionId");

-- CreateIndex
CREATE INDEX "Anotacion_autorId_idx" ON "Anotacion"("autorId");

-- CreateIndex
CREATE INDEX "Anotacion_estado_idx" ON "Anotacion"("estado");

-- CreateIndex
CREATE INDEX "PistaQuavedle_tipo_idx" ON "PistaQuavedle"("tipo");

-- CreateIndex
CREATE INDEX "PistaQuavedle_dificultad_idx" ON "PistaQuavedle"("dificultad");

-- CreateIndex
CREATE INDEX "PistaQuavedle_usadaEnDiario_idx" ON "PistaQuavedle"("usadaEnDiario");

-- CreateIndex
CREATE UNIQUE INDEX "PartidaDiaria_fecha_key" ON "PartidaDiaria"("fecha");

-- CreateIndex
CREATE INDEX "PartidaDiaria_fecha_idx" ON "PartidaDiaria"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "EstadisticaUsuario_usuarioId_tipoJuego_key" ON "EstadisticaUsuario"("usuarioId", "tipoJuego");

-- CreateIndex
CREATE UNIQUE INDEX "Logro_nombre_key" ON "Logro"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioLogro_usuarioId_logroId_key" ON "UsuarioLogro"("usuarioId", "logroId");

-- CreateIndex
CREATE INDEX "PistaVersoOculto_cancionId_idx" ON "PistaVersoOculto"("cancionId");

-- CreateIndex
CREATE INDEX "PistaVersoOculto_dificultad_idx" ON "PistaVersoOculto"("dificultad");

-- CreateIndex
CREATE INDEX "PistaVersoOculto_usadaEnDiario_idx" ON "PistaVersoOculto"("usadaEnDiario");

-- CreateIndex
CREATE UNIQUE INDEX "SeleccionDiaria_fecha_key" ON "SeleccionDiaria"("fecha");

-- CreateIndex
CREATE INDEX "SeleccionDiaria_fecha_idx" ON "SeleccionDiaria"("fecha");

-- CreateIndex
CREATE INDEX "Playlist_creadorId_idx" ON "Playlist"("creadorId");

-- CreateIndex
CREATE INDEX "PlaylistItem_playlistId_idx" ON "PlaylistItem"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_playlistId_spotifyId_key" ON "PlaylistItem"("playlistId", "spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistColaborador_playlistId_usuarioId_key" ON "PlaylistColaborador"("playlistId", "usuarioId");

-- CreateIndex
CREATE INDEX "Rating_spotifyId_tipo_idx" ON "Rating"("spotifyId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_usuarioId_spotifyId_tipo_key" ON "Rating"("usuarioId", "spotifyId", "tipo");

-- CreateIndex
CREATE INDEX "Comentario_spotifyId_tipo_idx" ON "Comentario"("spotifyId", "tipo");

-- CreateIndex
CREATE INDEX "Comentario_padreId_idx" ON "Comentario"("padreId");

-- AddForeignKey
ALTER TABLE "Jerga" ADD CONSTRAINT "Jerga_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_seguidorId_fkey" FOREIGN KEY ("seguidorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_siguiendoId_fkey" FOREIGN KEY ("siguiendoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancion" ADD CONSTRAINT "Cancion_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancionArtista" ADD CONSTRAINT "CancionArtista_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancionArtista" ADD CONSTRAINT "CancionArtista_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Letra" ADD CONSTRAINT "Letra_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_artistaMencionadoId_fkey" FOREIGN KEY ("artistaMencionadoId") REFERENCES "Artista"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartidaDiaria" ADD CONSTRAINT "PartidaDiaria_pistaId_fkey" FOREIGN KEY ("pistaId") REFERENCES "PistaQuavedle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadisticaUsuario" ADD CONSTRAINT "EstadisticaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioLogro" ADD CONSTRAINT "UsuarioLogro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioLogro" ADD CONSTRAINT "UsuarioLogro_logroId_fkey" FOREIGN KEY ("logroId") REFERENCES "Logro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PistaVersoOculto" ADD CONSTRAINT "PistaVersoOculto_cancionId_fkey" FOREIGN KEY ("cancionId") REFERENCES "Cancion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistColaborador" ADD CONSTRAINT "PlaylistColaborador_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistColaborador" ADD CONSTRAINT "PlaylistColaborador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "Comentario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
