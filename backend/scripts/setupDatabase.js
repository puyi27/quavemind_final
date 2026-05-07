import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// SQL para crear todas las tablas
const SQL_SCHEMA = `
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

-- Artistas
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

-- Relación Cancion-Artista
CREATE TABLE IF NOT EXISTS "CancionArtista" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cancionId" TEXT NOT NULL REFERENCES "Cancion"(id),
    "artistaId" TEXT NOT NULL REFERENCES "Artista"(id),
    "esPrincipal" BOOLEAN DEFAULT false,
    UNIQUE("cancionId", "artistaId")
);

-- Letras
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

-- Anotaciones
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

-- Pistas Quavedle
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

-- Partidas Diarias
CREATE TABLE IF NOT EXISTS "PartidaDiaria" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fecha TIMESTAMP UNIQUE NOT NULL,
    "pistaId" TEXT NOT NULL REFERENCES "PistaQuavedle"(id),
    "intentosTotales" INTEGER DEFAULT 0,
    "aciertosTotales" INTEGER DEFAULT 0
);

-- Pistas Verso Oculto
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

-- Estadísticas
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

-- Logros
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

-- UsuarioLogro
CREATE TABLE IF NOT EXISTS "UsuarioLogro" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    "logroId" TEXT NOT NULL REFERENCES "Logro"(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("usuarioId", "logroId")
);

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

-- Tablas Legacy
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
`;

// Datos iniciales
const DATOS_INICIALES = {
  usuario: {
    id: 1,
    alias: 'Admin QUAVEMIND',
    email: 'admin@quavemind.com',
    rol: 'ADMIN',
  },
  logros: [
    { nombre: 'Primeras Palabras', descripcion: 'Crea tu primera anotación', tipo: 'ANOTACIONES_CREADAS', requisito: 1, puntos: 10 },
    { nombre: 'Comentarista', descripcion: 'Crea 10 anotaciones', tipo: 'ANOTACIONES_CREADAS', requisito: 10, puntos: 50 },
    { nombre: 'Maestro del Barrio', descripcion: 'Crea 50 anotaciones', tipo: 'ANOTACIONES_CREADAS', requisito: 50, puntos: 200 },
    { nombre: 'Aprobado', descripcion: 'Obtén tu primera anotación aprobada', tipo: 'ANOTACIONES_APROBADAS', requisito: 1, puntos: 20 },
    { nombre: 'Destacado', descripcion: 'Obtén una anotación destacada', tipo: 'ANOTACIONES_DESTACADAS', requisito: 1, puntos: 100 },
    { nombre: 'Adivino Novato', descripcion: 'Gana tu primer juego', tipo: 'JUEGOS_GANADOS', requisito: 1, puntos: 10 },
    { nombre: 'Adivino Experto', descripcion: 'Gana 50 juegos', tipo: 'JUEGOS_GANADOS', requisito: 50, puntos: 100 },
    { nombre: 'Racha Perfecta', descripcion: 'Acerta 5 juegos seguidos', tipo: 'RACHA_PERFECTA', requisito: 5, puntos: 50 },
    { nombre: 'Fiel', descripcion: 'Juega 7 días seguidos', tipo: 'DIAS_CONSECUTIVOS', requisito: 7, puntos: 30 },
  ],
  artistas: [
    {
      id: '4q3ewBCwI0LHTlucSPPTu6',
      nombre: 'Bad Bunny',
      imagen: 'https://i.scdn.co/image/ab6761610000e5eb8ee9a6e25e307649d5b4307a',
      seguidores: 65000000,
      generos: ['reggaeton', 'latin', 'trap latino'],
      popularidad: 98,
      spotifyUrl: 'https://open.spotify.com/artist/4q3ewBCwI0LHTlucSPPTu6',
      bio: 'Benito Antonio Martínez Ocasio, conocido artísticamente como Bad Bunny, es un cantante, compositor y actor puertorriqueño.',
      paisOrigen: 'Puerto Rico',
      esVerificado: true,
    },
    {
      id: '1pQWsZQehhS4wavwh7Fnxd',
      nombre: 'Karol G',
      imagen: 'https://i.scdn.co/image/ab6761610000e5eb0568e9631fd34f350edcb4a8',
      seguidores: 45000000,
      generos: ['reggaeton', 'latin', 'urbano latino'],
      popularidad: 95,
      spotifyUrl: 'https://open.spotify.com/artist/1pQWsZQehhS4wavwh7Fnxd',
      bio: 'Carolina Giraldo Navarro, conocida como Karol G, es una cantante y compositora colombiana.',
      paisOrigen: 'Colombia',
      esVerificado: true,
    },
    {
      id: '716NhGYqMbp3rsDPZJ3FYe',
      nombre: 'Quevedo',
      imagen: 'https://i.scdn.co/image/ab6761610000e5ebf5b7f8d5e7c3e5f9d8e7f4a2',
      seguidores: 15000000,
      generos: ['reggaeton', 'urbano latino', 'trap latino'],
      popularidad: 88,
      spotifyUrl: 'https://open.spotify.com/artist/716NhGYqMbp3rsDPZJ3FYe',
      bio: 'Pedro Luis Domínguez Quevedo, conocido como Quevedo, es un cantante español de reggaetón y trap.',
      paisOrigen: 'España (Canarias)',
      esVerificado: true,
    },
  ],
  albumes: [
    {
      id: '3RQQmkQsmciyjZo6J6Oqit',
      nombre: 'Un Verano Sin Ti',
      imagen: 'https://i.scdn.co/image/ab67616d0000b27349ea3a9d3fcb4e1ab5f1e4f8',
      fecha: '2022-05-06',
      totalTracks: 23,
      label: 'Rimas Entertainment',
      spotifyUrl: 'https://open.spotify.com/album/3RQQmkQsmciyjZo6J6Oqit',
      tipo: 'ALBUM',
      artistaId: '4q3ewBCwI0LHTlucSPPTu6',
    },
    {
      id: '3jB9CmD27Ch5LHV6p8m5q3',
      nombre: 'MAÑANA SERÁ BONITO',
      imagen: 'https://i.scdn.co/image/ab67616d0000b273e7e5f4c3f8c5d2e9f1a3b4c5',
      fecha: '2023-02-24',
      totalTracks: 16,
      label: 'Bichota Records',
      spotifyUrl: 'https://open.spotify.com/album/3jB9CmD27Ch5LHV6p8m5q3',
      tipo: 'ALBUM',
      artistaId: '1pQWsZQehhS4wavwh7Fnxd',
    },
  ],
  canciones: [
    {
      id: '1IHWl5LamUGEuP4vKdpPSd',
      nombre: 'Tití Me Preguntó',
      duracion: 243000,
      previewUrl: 'https://p.scdn.co/mp3-preview/sample1',
      spotifyUrl: 'https://open.spotify.com/track/1IHWl5LamUGEuP4vKdpPSd',
      trackNumber: 2,
      albumId: '3RQQmkQsmciyjZo6J6Oqit',
      explicit: true,
      popularity: 95,
      bpm: 106.5,
      key: 5,
      energy: 0.82,
      danceability: 0.78,
      valence: 0.65,
    },
    {
      id: '3iUl9MtxNW8F5RrQBlWrab',
      nombre: 'Columbia',
      duracion: 198000,
      previewUrl: 'https://p.scdn.co/mp3-preview/sample2',
      spotifyUrl: 'https://open.spotify.com/track/3iUl9MtxNW8F5RrQBlWrab',
      trackNumber: 1,
      albumId: null,
      explicit: false,
      popularity: 92,
      bpm: 118.2,
      key: 8,
      energy: 0.75,
      danceability: 0.85,
      valence: 0.70,
    },
    {
      id: '7dSZ6j9lKkXhE3h9Kme7k7',
      nombre: 'Provenza',
      duracion: 210000,
      previewUrl: 'https://p.scdn.co/mp3-preview/sample3',
      spotifyUrl: 'https://open.spotify.com/track/7dSZ6j9lKkXhE3h9Kme7k7',
      trackNumber: 1,
      albumId: '3jB9CmD27Ch5LHV6p8m5q3',
      explicit: false,
      popularity: 94,
      bpm: 112.0,
      key: 3,
      energy: 0.68,
      danceability: 0.82,
      valence: 0.75,
    },
  ],
  letras: [
    {
      cancionId: '1IHWl5LamUGEuP4vKdpPSd',
      texto: `[Intro]
Tití me preguntó
Si tengo mucha novia
Mucha novia
Hoy tengo una, mañana otra
Pero no hay boda

[Verso 1]
Tití me preguntó
Si tengo mucha novia
Mucha novia
Hoy tengo una, mañana otra
Pero no hay boda

[Estribillo]
Me la voy a llevar a la Zona Paraíso
Aunque se ponga en rechazo
Yo la pongo a fumar y se me abre el apetito
En el Ferrari que to' lo hacemos bonito`,
      fuente: 'genius',
      estado: 'VERIFICADA',
    },
    {
      cancionId: '3iUl9MtxNW8F5RrQBlWrab',
      texto: `[Intro]
Columbia, Columbia
Desde que llegué a Canarias me siento en Colombia
Columbia, Columbia
Desde que llegué a Canarias me siento en Colombia

[Verso 1]
No sé qué me pasa últimamente
Que no paro de pensar en ti
Y en la forma en que tú te muevas
Me tiene loco, me tiene así`,
      fuente: 'genius',
      estado: 'VERIFICADA',
    },
  ],
  anotaciones: [
    {
      cancionId: '1IHWl5LamUGEuP4vKdpPSd',
      autorId: 1,
      inicio: 0,
      fin: 18,
      textoSeleccionado: 'Tití me preguntó',
      titulo: 'La famosa Tití',
      contenido: 'En esta canción, Bad Bunny hace referencia a su tía (tití en Puerto Rico) que siempre le pregunta sobre sus novias. Se convirtió en un meme viral en redes sociales.',
      estado: 'APROBADA',
      votosPositivos: 42,
      votosNegativos: 2,
    },
    {
      cancionId: '1IHWl5LamUGEuP4vKdpPSd',
      autorId: 1,
      inicio: 115,
      fin: 140,
      textoSeleccionado: 'Me la voy a llevar a la Zona Paraíso',
      titulo: 'Zona Paraíso',
      contenido: 'La Zona Paraíso es un lugar en Puerto Rico donde Bad Bunny suele pasar tiempo. Es conocido por ser una zona exclusiva y de lujo.',
      estado: 'APROBADA',
      votosPositivos: 28,
      votosNegativos: 1,
    },
    {
      cancionId: '3iUl9MtxNW8F5RrQBlWrab',
      autorId: 1,
      inicio: 0,
      fin: 9,
      textoSeleccionado: 'Columbia',
      titulo: 'Referencia a Colombia',
      contenido: 'Quevedo compara la vibra de Canarias con Colombia, destacando la calidez y energía similar entre ambos lugares.',
      estado: 'APROBADA',
      votosPositivos: 35,
      votosNegativos: 3,
    },
  ],
  relacionesCancionArtista: [
    { cancionId: '1IHWl5LamUGEuP4vKdpPSd', artistaId: '4q3ewBCwI0LHTlucSPPTu6', esPrincipal: true },
    { cancionId: '3iUl9MtxNW8F5RrQBlWrab', artistaId: '716NhGYqMbp3rsDPZJ3FYe', esPrincipal: true },
    { cancionId: '7dSZ6j9lKkXhE3h9Kme7k7', artistaId: '1pQWsZQehhS4wavwh7Fnxd', esPrincipal: true },
  ],
  versosOculto: [
    {
      id: 'verso_1IHWl5LamUGEuP4vKdpPSd_0',
      cancionId: '1IHWl5LamUGEuP4vKdpPSd',
      verso: 'Tití me preguntó si tengo mucha novia',
      inicioVerso: 0,
      finVerso: 44,
      pistaArtista: 'Artista de Puerto Rico, conejo malo',
      pistaAnio: 2022,
      pistaAlbum: 'Un Verano Sin Ti',
      dificultad: 1,
    },
    {
      id: 'verso_1IHWl5LamUGEuP4vKdpPSd_115',
      cancionId: '1IHWl5LamUGEuP4vKdpPSd',
      verso: 'Me la voy a llevar a la Zona Paraíso',
      inicioVerso: 115,
      finVerso: 156,
      pistaArtista: 'Artista de Puerto Rico',
      pistaAnio: 2022,
      pistaAlbum: null,
      dificultad: 3,
    },
    {
      id: 'verso_3iUl9MtxNW8F5RrQBlWrab_0',
      cancionId: '3iUl9MtxNW8F5RrQBlWrab',
      verso: 'Columbia, Columbia, desde que llegué a Canarias me siento en Colombia',
      inicioVerso: 0,
      finVerso: 71,
      pistaArtista: 'Artista canario, BZRP Session #52',
      pistaAnio: 2023,
      pistaAlbum: null,
      dificultad: 2,
    },
    {
      id: 'verso_7dSZ6j9lKkXhE3h9Kme7k7_0',
      cancionId: '7dSZ6j9lKkXhE3h9Kme7k7',
      verso: 'Si tú me llamas, nos vamo pa Provenza',
      inicioVerso: 0,
      finVerso: 41,
      pistaArtista: 'Artista colombiana, la Bichota',
      pistaAnio: 2022,
      pistaAlbum: 'MAÑANA SERÁ BONITO',
      dificultad: 2,
    },
    {
      id: 'verso_7dSZ6j9lKkXhE3h9Kme7k7_100',
      cancionId: '7dSZ6j9lKkXhE3h9Kme7k7',
      verso: 'Que la vida es una, hay que vivirla ahora',
      inicioVerso: 100,
      finVerso: 144,
      pistaArtista: 'Artista colombiana',
      pistaAnio: 2022,
      pistaAlbum: null,
      dificultad: 4,
    },
  ],
};

async function limpiarBaseDatos() {
  console.log('🧹 Limpiando base de datos existente...\n');
  
  const tablas = [
    'UsuarioLogro', 'Logro', 'EstadisticaUsuario', 'PartidaDiaria',
    'PistaVersoOculto', 'PistaQuavedle', 'Anotacion', 'Letra',
    'CancionArtista', 'Cancion', 'Album', 'Artista', 'Favorito',
    'Jerga', 'Creador', 'Usuario'
  ];
  
  for (const tabla of tablas) {
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tabla}" CASCADE`);
      console.log(`  ✓ Tabla ${tabla} eliminada`);
    } catch (e) {
      console.log(`  ⚠ Tabla ${tabla} no existía`);
    }
  }
}

async function crearTablas() {
  console.log('\n🔨 Creando nuevas tablas...\n');
  
  // Ejecutar SQL en bloques
  const statements = SQL_SCHEMA.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await prisma.$executeRawUnsafe(statement + ';');
      } catch (e) {
        // Ignorar errores de "ya existe"
      }
    }
  }
  
  console.log('  ✓ Tablas creadas');
}

async function insertarDatos() {
  console.log('\n📊 Insertando datos...\n');
  
  // Usuario
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Usuario" (id, alias, email, rol) 
    VALUES (${DATOS_INICIALES.usuario.id}, '${DATOS_INICIALES.usuario.alias}', '${DATOS_INICIALES.usuario.email}', '${DATOS_INICIALES.usuario.rol}')
    ON CONFLICT (email) DO NOTHING
  `);
  console.log('  ✓ Usuario admin creado');
  
  // Logros
  for (const logro of DATOS_INICIALES.logros) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Logro" (nombre, descripcion, tipo, requisito, puntos)
      VALUES ('${logro.nombre}', '${logro.descripcion}', '${logro.tipo}', ${logro.requisito}, ${logro.puntos})
      ON CONFLICT (nombre) DO NOTHING
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.logros.length} logros creados`);
  
  // Artistas
  for (const artista of DATOS_INICIALES.artistas) {
    const generos = artista.generos.map(g => `'${g}'`).join(',');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Artista" (id, nombre, imagen, seguidores, generos, popularidad, "spotifyUrl", bio, "paisOrigen", "esVerificado")
      VALUES ('${artista.id}', '${artista.nombre}', '${artista.imagen}', ${artista.seguidores}, ARRAY[${generos}], ${artista.popularidad}, '${artista.spotifyUrl}', '${artista.bio}', '${artista.paisOrigen}', ${artista.esVerificado})
      ON CONFLICT (id) DO NOTHING
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.artistas.length} artistas insertados`);
  
  // Álbumes
  for (const album of DATOS_INICIALES.albumes) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Album" (id, nombre, imagen, fecha, "totalTracks", label, "spotifyUrl", tipo, "artistaId")
      VALUES ('${album.id}', '${album.nombre}', '${album.imagen}', '${album.fecha}', ${album.totalTracks}, '${album.label}', '${album.spotifyUrl}', '${album.tipo}', '${album.artistaId}')
      ON CONFLICT (id) DO NOTHING
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.albumes.length} álbumes insertados`);
  
  // Canciones (primero las que tienen álbum, luego las que no)
  const cancionesConAlbum = DATOS_INICIALES.canciones.filter(c => c.albumId);
  const cancionesSinAlbum = DATOS_INICIALES.canciones.filter(c => !c.albumId);
  
  for (const cancion of cancionesConAlbum) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Cancion" (id, nombre, duracion, "previewUrl", "spotifyUrl", "trackNumber", "albumId", explicit, popularity, bpm, key, energy, danceability, valence)
      VALUES ('${cancion.id}', '${cancion.nombre}', ${cancion.duracion}, '${cancion.previewUrl}', '${cancion.spotifyUrl}', ${cancion.trackNumber}, '${cancion.albumId}', ${cancion.explicit}, ${cancion.popularity}, ${cancion.bpm}, ${cancion.key}, ${cancion.energy}, ${cancion.danceability}, ${cancion.valence})
      ON CONFLICT (id) DO NOTHING
    `);
  }
  
  for (const cancion of cancionesSinAlbum) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Cancion" (id, nombre, duracion, "previewUrl", "spotifyUrl", "trackNumber", "albumId", explicit, popularity, bpm, key, energy, danceability, valence)
      VALUES ('${cancion.id}', '${cancion.nombre}', ${cancion.duracion}, '${cancion.previewUrl}', '${cancion.spotifyUrl}', ${cancion.trackNumber}, NULL, ${cancion.explicit}, ${cancion.popularity}, ${cancion.bpm}, ${cancion.key}, ${cancion.energy}, ${cancion.danceability}, ${cancion.valence})
      ON CONFLICT (id) DO NOTHING
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.canciones.length} canciones insertadas`);
  
  // Relaciones Cancion-Artista
  for (const rel of DATOS_INICIALES.relacionesCancionArtista) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "CancionArtista" ("cancionId", "artistaId", "esPrincipal")
      VALUES ('${rel.cancionId}', '${rel.artistaId}', ${rel.esPrincipal})
      ON CONFLICT ("cancionId", "artistaId") DO NOTHING
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.relacionesCancionArtista.length} relaciones creadas`);
  
  // Letras
  for (const letra of DATOS_INICIALES.letras) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Letra" ("cancionId", texto, fuente, estado)
      VALUES ('${letra.cancionId}', '${letra.texto.replace(/'/g, "''")}', '${letra.fuente}', '${letra.estado}')
      ON CONFLICT ("cancionId") DO NOTHING
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.letras.length} letras insertadas`);
  
  // Anotaciones
  for (const anotacion of DATOS_INICIALES.anotaciones) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Anotacion" ("cancionId", "autorId", inicio, fin, "textoSeleccionado", titulo, contenido, estado, "votosPositivos", "votosNegativos")
      VALUES ('${anotacion.cancionId}', ${anotacion.autorId}, ${anotacion.inicio}, ${anotacion.fin}, '${anotacion.textoSeleccionado}', '${anotacion.titulo}', '${anotacion.contenido.replace(/'/g, "''")}', '${anotacion.estado}', ${anotacion.votosPositivos}, ${anotacion.votosNegativos})
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.anotaciones.length} anotaciones creadas`);
  
  // Versos Oculto
  for (const verso of DATOS_INICIALES.versosOculto) {
    const pistaAlbum = verso.pistaAlbum ? `'${verso.pistaAlbum}'` : 'NULL';
    await prisma.$executeRawUnsafe(`
      INSERT INTO "PistaVersoOculto" (id, "cancionId", verso, "inicioVerso", "finVerso", "pistaArtista", "pistaAnio", "pistaAlbum", dificultad)
      VALUES ('${verso.id}', '${verso.cancionId}', '${verso.verso.replace(/'/g, "''")}', ${verso.inicioVerso}, ${verso.finVerso}, '${verso.pistaArtista}', ${verso.pistaAnio}, ${pistaAlbum}, ${verso.dificultad})
      ON CONFLICT (id) DO NOTHING
    `);
  }
  console.log(`  ✓ ${DATOS_INICIALES.versosOculto.length} versos para juego creados`);
}

async function setup() {
  console.log('🚀 INICIANDO SETUP DE QUAVEMIND\n');
  console.log('=' .repeat(50));
  
  try {
    await limpiarBaseDatos();
    await crearTablas();
    await insertarDatos();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ SETUP COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(50));
    
    // Verificar conteos
    const counts = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM "Artista") as artistas,
        (SELECT COUNT(*) FROM "Album") as albumes,
        (SELECT COUNT(*) FROM "Cancion") as canciones,
        (SELECT COUNT(*) FROM "Letra") as letras,
        (SELECT COUNT(*) FROM "Anotacion") as anotaciones,
        (SELECT COUNT(*) FROM "PistaVersoOculto") as versos,
        (SELECT COUNT(*) FROM "Usuario") as usuarios,
        (SELECT COUNT(*) FROM "Logro") as logros
    `;
    
    console.log('\n📊 RESUMEN:');
    console.log(`   • Artistas: ${counts[0].artistas}`);
    console.log(`   • Álbumes: ${counts[0].albumes}`);
    console.log(`   • Canciones: ${counts[0].canciones}`);
    console.log(`   • Letras: ${counts[0].letras}`);
    console.log(`   • Anotaciones: ${counts[0].anotaciones}`);
    console.log(`   • Versos juego: ${counts[0].versos}`);
    console.log(`   • Usuarios: ${counts[0].usuarios}`);
    console.log(`   • Logros: ${counts[0].logros}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setup();