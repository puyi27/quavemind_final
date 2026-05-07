import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// IDs de Spotify de ejemplo (artistas y canciones populares del urbano latino)
const DATOS_EJEMPLO = {
  artistas: [
    { id: '4q3ewBCwI0LHTlucSPPTu6', nombre: 'Bad Bunny' },
    { id: '1pQWsZQehhS4wavwh7Fnxd', nombre: 'Karol G' },
    { id: '1vyhD5VmyZ7KMfW5gqLgo5', nombre: 'J Balvin' },
    { id: '7n2wHs1TKAczGzO7Dd2rGr', nombre: 'Shakira' },
    { id: '5C4PDR4LqR22Nq3y8t380m', nombre: 'Rauw Alejandro' },
    { id: '4SsVbpTthjScTS7U2hmr1X', nombre: 'Rosalía' },
    { id: '3vQ0GE3mI0dAaxIMYe5g7z', nombre: 'C. Tangana' },
    { id: '716NhGYqMbp3rsDPZJ3FYe', nombre: 'Quevedo' },
    { id: '1zNqDE7qDGCsyzJwohjpl8', nombre: 'Mora' },
    { id: '2LRoIwlKmHcjgOvGGjtCSm', nombre: 'Myke Towers' },
  ],
  canciones: [
    // Bad Bunny - Tití Me Preguntó
    { id: '1IHWl5LamUGEuP4vKdpPSd', artistaId: '4q3ewBCwI0LHTlucSPPTu6' },
    // Karol G - Provenza
    { id: '7dSZ6j9lKkXhE3h9Kme7k7', artistaId: '1pQWsZQehhS4wavwh7Fnxd' },
    // J Balvin - Mi Gente
    { id: '7rfoYqVfCFjXg7gcPr8F3r', artistaId: '1vyhD5VmyZ7KMfW5gqLgo5' },
    // Quevedo - Columbia
    { id: '3iUl9MtxNW8F5RrQBlWrab', artistaId: '716NhGYqMbp3rsDPZJ3FYe' },
    // Rosalía - Despechá
    { id: '3iUl9MtxNW8F5RrQBlWrab', artistaId: '4SsVbpTthjScTS7U2hmr1X' },
  ]
};

async function importarArtista(spotifyId, token) {
  try {
    // Verificar si ya existe
    const existente = await prisma.artista.findUnique({
      where: { id: spotifyId }
    });
    
    if (existente) {
      console.log(`✓ Artista ya existe: ${existente.nombre}`);
      return existente;
    }

    // Obtener de Spotify API
    const response = await fetch(`https://api.spotify.com/v1/artists/${spotifyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    const artista = await prisma.artista.create({
      data: {
        id: data.id,
        nombre: data.name,
        imagen: data.images?.[0]?.url,
        seguidores: data.followers?.total,
        generos: data.genres || [],
        popularidad: data.popularity,
        spotifyUrl: data.external_urls?.spotify,
        bio: `Artista de ${data.genres?.[0] || 'música urbana'}`,
      }
    });

    console.log(`✓ Artista importado: ${artista.nombre}`);
    return artista;
  } catch (error) {
    console.error(`✗ Error importando artista ${spotifyId}:`, error.message);
    return null;
  }
}

async function importarCancion(spotifyId, token) {
  try {
    const existente = await prisma.cancion.findUnique({
      where: { id: spotifyId },
      include: { artistas: true }
    });
    
    if (existente) {
      console.log(`✓ Canción ya existe: ${existente.nombre}`);
      return existente;
    }

    const [trackRes, featuresRes] = await Promise.all([
      fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`https://api.spotify.com/v1/audio-features/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    if (!trackRes.ok) {
      throw new Error(`Error HTTP: ${trackRes.status}`);
    }

    const trackData = await trackRes.json();
    const featuresData = featuresRes.ok ? await featuresRes.json() : null;

    // Importar álbum si existe
    if (trackData.album) {
      const album = trackData.album;
      const albumArtista = album.artists?.[0];
      
      if (albumArtista) {
        await prisma.artista.upsert({
          where: { id: albumArtista.id },
          update: {},
          create: {
            id: albumArtista.id,
            nombre: albumArtista.name,
            spotifyUrl: albumArtista.external_urls?.spotify,
          }
        });

        await prisma.album.upsert({
          where: { id: album.id },
          update: {},
          create: {
            id: album.id,
            nombre: album.name,
            imagen: album.images?.[0]?.url,
            fecha: album.release_date,
            artistaId: albumArtista.id,
            spotifyUrl: album.external_urls?.spotify,
            tipo: album.album_type?.toUpperCase() || 'ALBUM',
          }
        });
      }
    }

    // Crear canción
    const cancion = await prisma.cancion.create({
      data: {
        id: trackData.id,
        nombre: trackData.name,
        duracion: trackData.duration_ms,
        previewUrl: trackData.preview_url,
        spotifyUrl: trackData.external_urls?.spotify,
        trackNumber: trackData.track_number,
        albumId: trackData.album?.id,
        explicit: trackData.explicit,
        popularity: trackData.popularity,
        bpm: featuresData?.tempo,
        key: featuresData?.key,
        energy: featuresData?.energy,
        danceability: featuresData?.danceability,
        valence: featuresData?.valence,
      }
    });

    // Relacionar artistas
    for (const artist of trackData.artists) {
      await prisma.artista.upsert({
        where: { id: artist.id },
        update: {},
        create: {
          id: artist.id,
          nombre: artist.name,
          spotifyUrl: artist.external_urls?.spotify,
        }
      });

      await prisma.cancionArtista.upsert({
        where: {
          cancionId_artistaId: {
            cancionId: trackData.id,
            artistaId: artist.id,
          }
        },
        update: { esPrincipal: trackData.artists[0]?.id === artist.id },
        create: {
          cancionId: trackData.id,
          artistaId: artist.id,
          esPrincipal: trackData.artists[0]?.id === artist.id,
        }
      });
    }

    console.log(`✓ Canción importada: ${cancion.nombre}`);
    return cancion;
  } catch (error) {
    console.error(`✗ Error importando canción ${spotifyId}:`, error.message);
    return null;
  }
}

async function seed() {
  console.log('🚀 Iniciando seed de datos de ejemplo...\n');

  // Obtener token de Spotify
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('❌ Faltan credenciales de Spotify en .env');
    process.exit(1);
  }

  try {
    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    console.log('🔑 Token obtenido\n');

    // Importar artistas
    console.log('📀 Importando artistas...');
    for (const artista of DATOS_EJEMPLO.artistas) {
      await importarArtista(artista.id, token);
    }

    console.log('\n🎵 Importando canciones...');
    for (const cancion of DATOS_EJEMPLO.canciones) {
      await importarCancion(cancion.id, token);
    }

    // Crear un usuario de prueba
    console.log('\n👤 Creando usuario de prueba...');
    const usuario = await prisma.usuario.upsert({
      where: { email: 'admin@quavemind.com' },
      update: {},
      create: {
        alias: 'Admin QUAVEMIND',
        email: 'admin@quavemind.com',
        rol: 'ADMIN',
      }
    });
    console.log(`✓ Usuario creado: ${usuario.alias} (ID: ${usuario.id})`);

    // Crear algunas anotaciones de ejemplo
    console.log('\n📝 Creando anotaciones de ejemplo...');
    
    // Obtener una canción para anotar
    const cancion = await prisma.cancion.findFirst();
    if (cancion) {
      await prisma.anotacion.create({
        data: {
          cancionId: cancion.id,
          autorId: usuario.id,
          inicio: 0,
          fin: 20,
          textoSeleccionado: 'Titi me pregunto',
          titulo: 'Referencia a Titi',
          contenido: 'En esta canción, Bad Bunny habla sobre su tía Titi que siempre le pregunta por sus novias. Es una referencia cultural muy conocida en Puerto Rico.',
          estado: 'APROBADA',
          votosPositivos: 15,
        }
      });
      console.log(`✓ Anotación de ejemplo creada en: ${cancion.nombre}`);
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- Artistas: ${await prisma.artista.count()}`);
    console.log(`- Álbumes: ${await prisma.album.count()}`);
    console.log(`- Canciones: ${await prisma.cancion.count()}`);
    console.log(`- Anotaciones: ${await prisma.anotacion.count()}`);

  } catch (error) {
    console.error('\n❌ Error en el seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();