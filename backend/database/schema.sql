-- QUAVEMIND Database Schema
-- Ejecutar esto en tu base de datos PostgreSQL (Neon)

-- ============================================
-- TABLAS BASE
-- ============================================

-- Selecciones Diarias (para El Radar)
CREATE TABLE IF NOT EXISTS "SeleccionDiaria" (
    fecha DATE PRIMARY KEY,
    "artistaDestacadoId" TEXT REFERENCES "Artista"(id),
    "descubrimientoUnderId" TEXT REFERENCES "Artista"(id),
    "cancionDelDiaId" TEXT REFERENCES "Cancion"(id),
    "albumDelDiaId" TEXT REFERENCES "Album"(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios
CREATE TABLE IF NOT EXISTS "Usuario" (
    id SERIAL PRIMARY KEY,
    alias TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    avatar TEXT,
    rol TEXT DEFAULT 'USUARIO' CHECK (rol IN ('ADMIN', 'MODERADOR', 'USUARIO', 'ARTISTA_VERIFICADO')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artistas (de Spotify)
CREATE TABLE IF NOT EXISTS "Artista" (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    imagen TEXT,
    seguidores INTEGER,
    generos TEXT[],
    popularidad INTEGER,
    "spotifyUrl" TEXT,
    bio TEXT,
    "paisOrigen" TEXT,
    "esVerificado" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Álbumes
CREATE TABLE IF NOT EXISTS "Album" (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    imagen TEXT,
    fecha TEXT,
    "totalTracks" INTEGER,
    label TEXT,
    "spotifyUrl" TEXT,
    tipo TEXT DEFAULT 'ALBUM' CHECK (tipo IN ('ALBUM', 'SINGLE', 'EP', 'COMPILATION')),
    "artistaId" TEXT NOT NULL REFERENCES "Artista"(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Canciones
CREATE TABLE IF NOT EXISTS "Cancion" (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    duracion INTEGER,
    "previewUrl" TEXT,
    "spotifyUrl" TEXT,
    "trackNumber" INTEGER,
    "albumId" TEXT REFERENCES "Album"(id),
    bpm REAL,
    key INTEGER,
    energy REAL,
    danceability REAL,
    valence REAL,
    explicit BOOLEAN DEFAULT false,
    popularity INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación Cancion-Artista (muchos a muchos)
CREATE TABLE IF NOT EXISTS "CancionArtista" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cancionId" TEXT NOT NULL REFERENCES "Cancion"(id),
    "artistaId" TEXT NOT NULL REFERENCES "Artista"(id),
    "esPrincipal" BOOLEAN DEFAULT false,
    UNIQUE("cancionId", "artistaId")
);

-- Letras de canciones
CREATE TABLE IF NOT EXISTS "Letra" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cancionId" TEXT UNIQUE NOT NULL REFERENCES "Cancion"(id),
    texto TEXT NOT NULL,
    fuente TEXT DEFAULT 'genius',
    "urlFuente" TEXT,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'VERIFICADA', 'COMPLETA', 'INCOMPLETA')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANOTACIONES (Sistema Genius)
-- ============================================

CREATE TABLE IF NOT EXISTS "Anotacion" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cancionId" TEXT NOT NULL REFERENCES "Cancion"(id),
    "autorId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    inicio INTEGER NOT NULL,
    fin INTEGER NOT NULL,
    "textoSeleccionado" TEXT NOT NULL,
    titulo TEXT,
    contenido TEXT NOT NULL,
    "votosPositivos" INTEGER DEFAULT 0,
    "votosNegativos" INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'DESTACADA')),
    "artistaMencionadoId" TEXT REFERENCES "Artista"(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- JUEGOS
-- ============================================

-- Pistas para Quavedle (juego original)
CREATE TABLE IF NOT EXISTS "PistaQuavedle" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tipo TEXT NOT NULL CHECK (tipo IN ('ALBUM', 'CANCION', 'ARTISTA', 'COVER')),
    respuesta TEXT NOT NULL,
    artista TEXT NOT NULL,
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
    dificultad INTEGER DEFAULT 3,
    "usadaEnDiario" TIMESTAMP,
    "vecesJugada" INTEGER DEFAULT 0,
    aciertos INTEGER DEFAULT 0,
    fallos INTEGER DEFAULT 0,
    "imagenUrl" TEXT,
    "spotifyId" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partidas diarias Quavedle
CREATE TABLE IF NOT EXISTS "PartidaDiaria" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fecha TIMESTAMP UNIQUE NOT NULL,
    "pistaId" TEXT NOT NULL REFERENCES "PistaQuavedle"(id),
    "intentosTotales" INTEGER DEFAULT 0,
    "aciertosTotales" INTEGER DEFAULT 0
);

-- Pistas para Verso Oculto (nuevo juego)
CREATE TABLE IF NOT EXISTS "PistaVersoOculto" (
    id TEXT PRIMARY KEY,
    "cancionId" TEXT NOT NULL REFERENCES "Cancion"(id),
    verso TEXT NOT NULL,
    "inicioVerso" INTEGER NOT NULL,
    "finVerso" INTEGER NOT NULL,
    "pistaArtista" TEXT,
    "pistaAnio" INTEGER,
    "pistaAlbum" TEXT,
    dificultad INTEGER DEFAULT 3,
    "usadaEnDiario" TIMESTAMP,
    "vecesJugada" INTEGER DEFAULT 0,
    aciertos INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ESTADÍSTICAS Y LOGROS
-- ============================================

CREATE TABLE IF NOT EXISTS "EstadisticaUsuario" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    "tipoJuego" TEXT NOT NULL CHECK ("tipoJuego" IN ('QUAVEDLE_ALBUM', 'QUAVEDLE_CANCION', 'QUAVEDLE_ARTISTA', 'QUAVEDLE_COVER', 'VERSO_OCULTO', 'CADENA_TEMAS')),
    jugadas INTEGER DEFAULT 0,
    aciertos INTEGER DEFAULT 0,
    "rachaActual" INTEGER DEFAULT 0,
    "mejorRacha" INTEGER DEFAULT 0,
    "ultimaJugada" TIMESTAMP,
    UNIQUE("usuarioId", "tipoJuego")
);

-- Logros disponibles
CREATE TABLE IF NOT EXISTS "Logro" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    icono TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('ANOTACIONES_CREADAS', 'ANOTACIONES_APROBADAS', 'ANOTACIONES_DESTACADAS', 'JUEGOS_GANADOS', 'RACHA_PERFECTA', 'DIAS_CONSECUTIVOS', 'CANCIONES_IMPORTADAS')),
    requisito INTEGER NOT NULL,
    puntos INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logros desbloqueados por usuarios
CREATE TABLE IF NOT EXISTS "UsuarioLogro" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    "logroId" TEXT NOT NULL REFERENCES "Logro"(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("usuarioId", "logroId")
);

-- ============================================
-- TABLAS LEGACY (para compatibilidad)
-- ============================================

CREATE TABLE IF NOT EXISTS "Creador" (
    id SERIAL PRIMARY KEY,
    alias TEXT UNIQUE NOT NULL,
    "rolPrincipal" TEXT NOT NULL,
    biografia TEXT,
    "barrioOrigen" TEXT
);

CREATE TABLE IF NOT EXISTS "Jerga" (
    id SERIAL PRIMARY KEY,
    termino TEXT UNIQUE NOT NULL,
    significado TEXT NOT NULL,
    contexto TEXT,
    origen TEXT,
    "cancionId" TEXT REFERENCES "Cancion"(id)
);

CREATE TABLE IF NOT EXISTS "Favorito" (
    id SERIAL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    "spotifyId" TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('CANCION', 'ARTISTA', 'ALBUM')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("usuarioId", "spotifyId", tipo)
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cancion_album ON "Cancion"("albumId");
CREATE INDEX IF NOT EXISTS idx_cancion_nombre ON "Cancion"(nombre);
CREATE INDEX IF NOT EXISTS idx_artista_nombre ON "Artista"(nombre);
CREATE INDEX IF NOT EXISTS idx_artista_popularidad ON "Artista"(popularidad);
CREATE INDEX IF NOT EXISTS idx_album_artista ON "Album"("artistaId");
CREATE INDEX IF NOT EXISTS idx_album_fecha ON "Album"(fecha);
CREATE INDEX IF NOT EXISTS idx_anotacion_cancion ON "Anotacion"("cancionId");
CREATE INDEX IF NOT EXISTS idx_anotacion_autor ON "Anotacion"("autorId");
CREATE INDEX IF NOT EXISTS idx_anotacion_estado ON "Anotacion"(estado);
CREATE INDEX IF NOT EXISTS idx_cancionartista_artista ON "CancionArtista"("artistaId");
CREATE INDEX IF NOT EXISTS idx_pistaquavedle_tipo ON "PistaQuavedle"(tipo);
CREATE INDEX IF NOT EXISTS idx_pistaquavedle_dificultad ON "PistaQuavedle"(dificultad);
CREATE INDEX IF NOT EXISTS idx_pistaverso_cancion ON "PistaVersoOculto"("cancionId");
CREATE INDEX IF NOT EXISTS idx_partidadiaria_fecha ON "PartidaDiaria"(fecha);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Usuario admin
INSERT INTO "Usuario" (id, alias, email, rol) 
VALUES (1, 'Admin QUAVEMIND', 'admin@quavemind.com', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Logros de ejemplo
INSERT INTO "Logro" (nombre, descripcion, tipo, requisito, puntos) VALUES
('Primeras Palabras', 'Crea tu primera anotación', 'ANOTACIONES_CREADAS', 1, 10),
('Comentarista', 'Crea 10 anotaciones', 'ANOTACIONES_CREADAS', 10, 50),
('Maestro del Barrio', 'Crea 50 anotaciones', 'ANOTACIONES_CREADAS', 50, 200),
('Aprobado', 'Obtén tu primera anotación aprobada', 'ANOTACIONES_APROBADAS', 1, 20),
('Destacado', 'Obtén una anotación destacada', 'ANOTACIONES_DESTACADAS', 1, 100),
('Adivino Novato', 'Gana tu primer juego', 'JUEGOS_GANADOS', 1, 10),
('Adivino Experto', 'Gana 50 juegos', 'JUEGOS_GANADOS', 50, 100),
('Racha Perfecta', 'Acerta 5 juegos seguidos', 'RACHA_PERFECTA', 5, 50),
('Fiel', 'Juega 7 días seguidos', 'DIAS_CONSECUTIVOS', 7, 30)
ON CONFLICT (nombre) DO NOTHING;