import { Router } from 'express';
import prisma from '../db.js';
import { normalizeArtistList } from '../lib/artistValidator.js';

const router = Router();
const SPOTIFY_TOKEN_URL = 'https://' + 'accounts.' + 'spotify.' + 'com/api/token';
const SPOTIFY_API_BASE = 'https://' + 'api.' + 'spotify.' + 'com/v1';

// Helper para obtener token de Spotify
const getSpotifyToken = async () => {
  const credentials = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });
  const data = await response.json();
  return data.access_token;
};

// Función para convertir BigInt a string
const convertBigInt = (obj) => {
  if (!obj) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(convertBigInt);
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertBigInt(v)])
    );
  }
  return obj;
};

// Obtener seed determinista del día
function getDailySeed() {
  const hoy = new Date();
  return hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
}

// Aleatorio con seed
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Seleccionar elemento del día basado en seed
function getElementoDelDia(array, seed, offset = 0) {
  if (!array || array.length === 0) return null;
  const index = Math.floor(seededRandom(seed + offset) * array.length);
  return array[index];
}

// GET /api/radar/diario - Todo el contenido del día
router.get('/diario', async (req, res) => {
  try {
    const seed = getDailySeed();
    const hoy = new Date().toISOString().split('T')[0];

    // Verificar si la tabla SeleccionDiaria existe, si no, crear selecciones en memoria
    let seleccion;
    try {
      const seleccionesHoy = await prisma.$queryRaw`
        SELECT * FROM "SeleccionDiaria" WHERE fecha = ${hoy}::date LIMIT 1
      `;
      
      if (seleccionesHoy.length > 0) {
        seleccion = seleccionesHoy[0];
      }
    } catch (e) {
      // Tabla no existe, continuamos sin cache
      console.log('SeleccionDiaria no existe, usando selección en memoria');
    }

    // Si no hay selección cacheada, crear una nueva
    if (!seleccion) {
      // Obtener candidatos
      const [artistasPopulares, artistasUnder, canciones, albumes] = await Promise.all([
        // Artistas populares (>70 popularidad)
        prisma.$queryRaw`
          SELECT id, nombre, imagen, popularidad, seguidores, generos FROM "Artista" WHERE popularidad > 70 ORDER BY popularidad DESC LIMIT 50
        `.catch(() => []),
        // Artistas under (<50 popularidad)
        prisma.$queryRaw`
          SELECT id, nombre, imagen, popularidad, seguidores, generos FROM "Artista" WHERE popularidad < 50 OR popularidad IS NULL ORDER BY RANDOM() LIMIT 100
        `.catch(() => []),
        // Canciones con letra
        prisma.$queryRaw`
          SELECT c.id, c.nombre, c.duracion_ms, c.preview_url, a.nombre as artista_nombre, al.imagen as album_imagen
          FROM "Cancion" c
          LEFT JOIN "CancionArtista" ca ON ca."cancionId" = c.id AND ca."esPrincipal" = true
          LEFT JOIN "Artista" a ON a.id = ca."artistaId"
          LEFT JOIN "Album" al ON al.id = c."albumId"
          LIMIT 200
        `.catch(() => []),
        // Álbumes recientes
        prisma.$queryRaw`
          SELECT al.id, al.nombre, al.imagen, al.fecha, ar.nombre as artista_nombre
          FROM "Album" al
          JOIN "Artista" ar ON ar.id = al."artistaId"
          ORDER BY al.fecha DESC NULLS LAST
          LIMIT 100
        `.catch(() => [])
      ]);

      // Seleccionar del día
      const artistaDestacado = getElementoDelDia(artistasPopulares, seed, 1);
      const descubrimientoUnder = getElementoDelDia(artistasUnder, seed, 2);
      const cancionDelDia = getElementoDelDia(canciones, seed, 3);
      const albumDelDia = getElementoDelDia(albumes, seed, 4);

      seleccion = {
        artistaDestacadoId: artistaDestacado?.id,
        descubrimientoUnderId: descubrimientoUnder?.id,
        cancionDelDiaId: cancionDelDia?.id,
        albumDelDiaId: albumDelDia?.id
      };

      // Intentar guardar en cache (si la tabla existe)
      try {
        await prisma.$executeRaw`
          INSERT INTO "SeleccionDiaria" (
            fecha, "artistaDestacadoId", "descubrimientoUnderId", 
            "cancionDelDiaId", "albumDelDiaId"
          ) VALUES (
            ${hoy}::date,
            ${seleccion.artistaDestacadoId || null},
            ${seleccion.descubrimientoUnderId || null},
            ${seleccion.cancionDelDiaId || null},
            ${seleccion.albumDelDiaId || null}
          )
          ON CONFLICT (fecha) DO UPDATE SET
            "artistaDestacadoId" = EXCLUDED."artistaDestacadoId",
            "descubrimientoUnderId" = EXCLUDED."descubrimientoUnderId",
            "cancionDelDiaId" = EXCLUDED."cancionDelDiaId",
            "albumDelDiaId" = EXCLUDED."albumDelDiaId"
        `;
      } catch (e) {
        // Ignorar error si la tabla no existe
      }
    }

    // Obtener datos completos
    const [artistaDestacado, descubrimientoUnder, cancionDelDia, albumDelDia, trending] = await Promise.all([
      // Artista destacado
      seleccion.artistaDestacadoId ? prisma.$queryRaw`
        SELECT a.id, a.nombre, a.imagen, a.popularidad, a.seguidores, a.generos, a.biografia, a.spotifyUrl,
          (SELECT COUNT(*) FROM "Album" WHERE "artistaId" = a.id) as total_albumes,
          (SELECT COUNT(*) FROM "CancionArtista" ca JOIN "Cancion" c ON c.id = ca."cancionId" WHERE ca."artistaId" = a.id) as total_canciones
        FROM "Artista" a WHERE a.id = ${seleccion.artistaDestacadoId}
      `.catch(() => []) : [],
      
      // Descubrimiento under
      seleccion.descubrimientoUnderId ? prisma.$queryRaw`
        SELECT a.id, a.nombre, a.imagen, a.popularidad, a.seguidores, a.generos FROM "Artista" a WHERE a.id = ${seleccion.descubrimientoUnderId}
      `.catch(() => []) : [],
      
      // Canción del día
      seleccion.cancionDelDiaId ? prisma.$queryRaw`
        SELECT c.id, c.nombre, c.duracion_ms, c.preview_url, a.nombre as artista_nombre, al.imagen as album_imagen
        FROM "Cancion" c
        LEFT JOIN "CancionArtista" ca ON ca."cancionId" = c.id AND ca."esPrincipal" = true
        LEFT JOIN "Artista" a ON a.id = ca."artistaId"
        LEFT JOIN "Album" al ON al.id = c."albumId"
        WHERE c.id = ${seleccion.cancionDelDiaId}
      `.catch(() => []) : [],
      
      // Álbum del día
      seleccion.albumDelDiaId ? prisma.$queryRaw`
        SELECT al.id, al.nombre, al.imagen, al.fecha, ar.nombre as artista_nombre, ar.imagen as artista_imagen
        FROM "Album" al
        JOIN "Artista" ar ON ar.id = al."artistaId"
        WHERE al.id = ${seleccion.albumDelDiaId}
      `.catch(() => []) : [],

      // Trending
      prisma.$queryRaw`
        SELECT c.id, c.nombre, a.nombre as artista_nombre, COUNT(an.id) as num_anotaciones
        FROM "Cancion" c
        JOIN "Anotacion" an ON an."cancionId" = c.id
        JOIN "CancionArtista" ca ON ca."cancionId" = c.id AND ca."esPrincipal" = true
        JOIN "Artista" a ON a.id = ca."artistaId"
        WHERE an."createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY c.id, c.nombre, a.nombre
        ORDER BY num_anotaciones DESC
        LIMIT 5
      `.catch(() => [])
    ]);

    res.json({
      status: 'ok',
      fecha: hoy,
      radar: {
        artistaDestacado: convertBigInt(artistaDestacado?.[0]) || null,
        descubrimientoUnder: convertBigInt(descubrimientoUnder?.[0]) || null,
        cancionDelDia: convertBigInt(cancionDelDia?.[0]) || null,
        albumDelDia: convertBigInt(albumDelDia?.[0]) || null,
        trending: convertBigInt(trending) || []
      }
    });

  } catch (error) {
    console.error('Error en /diario:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// GET /api/radar/conexiones/:artistaId - SongDNA
router.get('/conexiones/:artistaId', async (req, res) => {
  try {
    const { artistaId } = req.params;

    // Artista central
    const artista = await prisma.$queryRaw`
      SELECT * FROM "Artista" WHERE id = ${artistaId}
    `.catch(() => []);

    // Fallback total a Spotify si el artista no está en BD local.
    if (!artista.length) {
      try {
        const token = await getSpotifyToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [artistRes, relatedRes] = await Promise.all([
          fetch(`${SPOTIFY_API_BASE}/artists/${artistaId}`, { headers }),
          fetch(`${SPOTIFY_API_BASE}/artists/${artistaId}/related-artists`, { headers }),
        ]);

        if (!artistRes.ok) {
          return res.status(404).json({ status: 'error', mensaje: 'Artista no encontrado' });
        }

        const artistData = await artistRes.json();
        const relatedData = relatedRes.ok ? await relatedRes.json() : { artists: [] };
        const similaresRaw = (relatedData.artists || []).map((a) => ({
          id: a.id,
          nombre: a.name,
          imagen: a.images?.[0]?.url || null,
          popularidad: a.popularity || 0,
          seguidores: a.followers?.total || 0,
          generos: a.genres || [],
          tipo: 'spotify_related'
        }));

        const similares = normalizeArtistList(similaresRaw);

        return res.json({
          status: 'ok',
          artista: {
            id: artistData.id,
            nombre: artistData.name,
            imagen: artistData.images?.[0]?.url || null,
            popularidad: artistData.popularity || 0,
            seguidores: artistData.followers?.total || 0,
            generos: artistData.genres || []
          },
          conexiones: {
            featurings: [],
            similares: convertBigInt(similares) || [],
            discografia: []
          }
        });
      } catch (e) {
        return res.status(404).json({ status: 'error', mensaje: 'Artista no encontrado' });
      }
    }

    // Conexiones por featuring
    const featurings = await prisma.$queryRaw`
      SELECT DISTINCT a2.id, a2.nombre, a2.imagen, 'featuring' as tipo
      FROM "CancionArtista" ca1
      JOIN "CancionArtista" ca2 ON ca2."cancionId" = ca1."cancionId" AND ca2."artistaId" != ca1."artistaId"
      JOIN "Artista" a2 ON a2.id = ca2."artistaId"
      WHERE ca1."artistaId" = ${artistaId}
      LIMIT 20
    `.catch(() => []);

    // Artistas similares por género (Database)
    const generos = artista[0].generos || [];
    const similaresDB = generos.length > 0 ? await prisma.$queryRaw`
      SELECT a.*, 'similar' as tipo,
        (SELECT COUNT(*) FROM UNNEST(a.generos) g WHERE g = ANY(${generos}::text[])) as coincidencias
      FROM "Artista" a
      WHERE a.id != ${artistaId}
        AND a.generos && ${generos}::text[]
      ORDER BY coincidencias DESC, a.popularidad DESC
      LIMIT 15
    `.catch(() => []) : [];

    // Artistas similares (Spotify - Nivel 1)
    let l1Spotify = [];
    let l2Spotify = [];
    try {
      const token = await getSpotifyToken();
      const resSpotify = await fetch(`${SPOTIFY_API_BASE}/artists/${artistaId}/related-artists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataSpotify = await resSpotify.json();
      l1Spotify = dataSpotify.artists || [];

      // RED AMPLIADA (Nivel 2)
      const topL1 = l1Spotify.sort((a, b) => b.popularity - a.popularity).slice(0, 4);
      const l2Promises = topL1.map(art => 
        fetch(`${SPOTIFY_API_BASE}/artists/${art.id}/related-artists`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .catch(() => ({ artists: [] }))
      );
      const l2Results = await Promise.all(l2Promises);
      l2Spotify = l2Results.flatMap(res => res.artists || []);

    } catch (e) {
      console.error("Error buscando similares en Spotify:", e.message);
    }

    // Mapear y combinar todo
    const mapArtist = (a) => ({
      id: a.id,
      nombre: a.name || a.nombre,
      imagen: a.images?.[0]?.url || a.imagen,
      popularidad: a.popularity,
      seguidores: a.followers?.total || a.seguidores,
      generos: a.genres || a.generos,
      tipo: 'relacionado'
    });

    const todosSimilares = [...similaresDB, ...l1Spotify, ...l2Spotify];
    const uniqueMap = new Map(todosSimilares.map(a => [a.id, mapArtist(a)]));

    // RELLENO POR GÉNERO (Si hay pocos)
    if (uniqueMap.size < 12 && l1Spotify.length > 0) {
      const mainGenre = l1Spotify[0].genres?.[0];
      if (mainGenre) {
        try {
          const token = await getSpotifyToken();
          const genreRes = await fetch(`${SPOTIFY_API_BASE}/search?q=genre:${encodeURIComponent(mainGenre)}&type=artist&limit=30&market=ES`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const genreData = await genreRes.json();
          (genreData.artists?.items || []).forEach(a => {
            if (a.id !== artistaId && !uniqueMap.has(a.id)) {
              uniqueMap.set(a.id, mapArtist(a));
            }
          });
        } catch (e) {}
      }
    }

    const uniqueSimilaresRaw = Array.from(uniqueMap.values())
      .filter(a => a.id !== artistaId);

    const uniqueSimilares = normalizeArtistList(uniqueSimilaresRaw)
      .sort(() => 0.5 - Math.random())
      .slice(0, 60);

    // Álbumes del artista
    const discografia = await prisma.$queryRaw`
      SELECT * FROM "Album" WHERE "artistaId" = ${artistaId} ORDER BY fecha DESC
    `.catch(() => []);

    res.json({
      status: 'ok',
      artista: convertBigInt(artista[0]),
      conexiones: {
        featurings: convertBigInt(featurings) || [],
        similares: convertBigInt(uniqueSimilares) || [],
        discografia: convertBigInt(discografia) || []
      }
    });

  } catch (error) {
    console.error('Error en /conexiones:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// GET /api/radar/noticias - El Chisme
router.get('/noticias', async (req, res) => {
  try {
    // Noticias simuladas
    const noticias = [
      {
        id: 1,
        tipo: 'lanzamiento',
        titulo: 'Bad Bunny anuncia nuevo álbum para 2024',
        fecha: '2024-01-15',
        imagen: 'https://example.com/bad-bunny.jpg',
        resumen: 'El conejo malo sorprende con una fecha inesperada...',
        fuente: 'Billboard'
      },
      {
        id: 2,
        tipo: 'rumor',
        titulo: '¿Colaboración entre Feid y Quevedo en camino?',
        fecha: '2024-01-14',
        imagen: null,
        resumen: 'Los fans especulan tras un video en Instagram...',
        fuente: 'Twitter'
      }
    ];

    // Calendario de lanzamientos
    const proximosLanzamientos = await prisma.$queryRaw`
      SELECT al.*, ar.nombre as artista_nombre
      FROM "Album" al
      JOIN "Artista" ar ON ar.id = al."artistaId"
      WHERE al.fecha > NOW()::text
      ORDER BY al.fecha ASC
      LIMIT 5
    `.catch(() => []);

    res.json({
      status: 'ok',
      noticias,
      proximosLanzamientos: convertBigInt(proximosLanzamientos) || []
    });

  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// GET /api/radar/trending
router.get('/trending', async (req, res) => {
  try {
    const { tipo = 'canciones', dias = 7 } = req.query;

    let resultado;

    if (tipo === 'canciones') {
      resultado = await prisma.$queryRaw`
        SELECT c.*, a.nombre as artista_nombre, COUNT(an.id) as actividad
        FROM "Cancion" c
        JOIN "Anotacion" an ON an."cancionId" = c.id
        JOIN "CancionArtista" ca ON ca."cancionId" = c.id AND ca."esPrincipal" = true
        JOIN "Artista" a ON a.id = ca."artistaId"
        WHERE an."createdAt" > NOW() - (${Number(dias) || 7} * INTERVAL '1 day')
        GROUP BY c.id, a.nombre
        ORDER BY actividad DESC
        LIMIT 10
      `.catch(() => []);
    } else if (tipo === 'artistas') {
      resultado = await prisma.$queryRaw`
        SELECT a.*, COUNT(c.id) as num_canciones
        FROM "Artista" a
        JOIN "CancionArtista" ca ON ca."artistaId" = a.id
        JOIN "Cancion" c ON c.id = ca."cancionId"
        JOIN "Anotacion" an ON an."cancionId" = c.id
        WHERE an."createdAt" > NOW() - (${Number(dias) || 7} * INTERVAL '1 day')
        GROUP BY a.id
        ORDER BY num_canciones DESC
        LIMIT 10
      `.catch(() => []);
    }

    res.json({
      status: 'ok',
      tipo,
      dias,
      resultado: convertBigInt(resultado) || []
    });

  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

export default router;
