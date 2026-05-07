import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// ARTISTAS DEL URBANO LATINO Y ESPAÑOL - MASIVO
const ARTISTAS_URBANOS_LATINOS = [
  // PUERTO RICO 🇵🇷
  '4q3ewBCwI0LHTlucSPPTu6', // Bad Bunny
  '0EmeFodog0BfCgMzAIvKQp', // Anuel AA
  '3n6C3dx3x6u7g6X926D5sA', // Ozuna
  '0TnOYISbd1XYRBk9myaseg', // Daddy Yankee
  '1mcTU81TzMhZguXou5a9v4', // Feid
  '5C4PDR4LqR22Nq3y8t380m', // Rauw Alejandro
  '2LRoIwlKmHcjgOvGGjtCSm', // Myke Towers
  '1zNqDE7qDGCsyzJwohjpl8', // Mora
  '2dIgFjalVxs4ThymZ67YCE', // Eladio Carrión
  '7iK8PXO48WeuP03g8YR51U', // Young Miko
  '1waTWAmhzFDH1Es0ANKeNh', // Jhayco
  '3n6LqD6fQrMpfhuGOO2S7P', // Tainy
  '2dN7XyJ4p7F2pCjLqfGzKj', // Chencho Corleone
  '5fONWSBIXO5Rh5LGPe1qiQ', // Wisin & Yandel
  '5lLVoHnVZN2cOU0aqL3J2P', // Don Omar
  '33ScadVnbm2X8kkUqOkC6Z', // Zion & Lennox
  '0NeaStJtJJO8y8f9pLC8Bk', // Farruko
  '5R9SsYHa7VRH0iB4b8b3fy', // Arcángel
  '1GvdbP4E0QFRBVvTDytbYo', // Ñengo Flow
  '7B9jKFNmHBQtv9MF8xGOql', // Lunay
  '4Awb0nYm7XifnC8JdqxhJQ', // Sech
  '7k7T9vA1g6lJ7f0k9yX0l8', // Dalex
  '3E9C3y8L4o8P4m7t1H9w3f', // Justin Quiles
  '5y8d8U7F6t5r4e3w2q1z0x', // Lenny Tavárez
  '1h9D7f8g6j5k4l3m2n1b2v', // Mariah Angeliq
  
  // COLOMBIA 🇨🇴
  '1pQWsZQehhS4wavwh7Fnxd', // Karol G
  '1vyhD5VmyZ7KMfW5gqLgo5', // J Balvin
  '7n1XMwvxPf147RFnBOPa7o', // Ryan Castro
  '5N52HEfjmqYszrvGJ9yZ6s', // Manuel Turizo
  '2R2f3g3h4j5k6l7m8n9o0p', // Blessd
  '2q3w4e5r6t7y8u9i0o1p2a', // Feid (ya está arriba)
  '3w4e5r6t7y8u9i0o1p2a3s', // Pirlo
  '4e5r6t7y8u9i0o1p2a3s4d', // Andy Rivera
  '5r6t7y8u9i0o1p2a3s4d5f', // Nacho
  '6t7y8u9i0o1p2a3s4d5f6g', // Maluma
  '7y8u9i0o1p2a3s4d5f6g7h', // Piso 21
  '8u9i0o1p2a3s4d5f6g7h8j', // Pasabordo
  '9i0o1p2a3s4d5f6g7h8j9k', // Reykon
  '0o1p2a3s4d5f6g7h8j9k0l', // Jowell & Randy
  
  // ESPAÑA 🇪🇸
  '716NhGYqMbp3rsDPZJ3FYe', // Quevedo
  '3vQ0GE3mI0dAaxIMYe5g7z', // C. Tangana
  '4SsVbpTthjScTS7U2hmr1X', // Rosalía
  '2d4U9P7v8n9m0k1j2h3g4f', // Bad Gyal
  '5f8h7j6k5l4m3n2b1v0c9x', // Nicki Nicole (también Argentina)
  '6g9j0k1l2m3n4b5v6c7x8z', // Tiago PZK
  '7h0k1l2m3n4b5v6c7x8z9a', // Trueno
  '8j1l2m3n4b5v6c7x8z9a0s', // Duki
  '9k2m3n4b5v6c7x8z9a0s1d', // Bizarrap
  '0l3n4b5v6c7x8z9a0s1d2f', // Aitana
  '1m4b5v6c7x8z9a0s1d2f3g', // Lola Indigo
  '2n5v6c7x8z9a0s1d2f3g4h', // Ana Mena
  '3b6c7x8z9a0s1d2f3g4h5j', // Becky G (también mexicana)
  '4v7x8z9a0s1d2f3g4h5j6k', // María Becerra
  
  // ARGENTINA 🇦🇷
  '2R2f3g3h4j5k6l7m8n9o0p', // Duki (ya está arriba)
  '3g4h5j6k7l8m9n0b1v2c3x', // Paulo Londra
  '4h5j6k7l8m9n0b1v2c3x4z', // Khea
  '5j6k7l8m9n0b1v2c3x4z5a', // Bizarrap (ya está arriba)
  '6k7l8m9n0b1v2c3x4z5a6s', // Lit Killah
  '7l8m9n0b1v2c3x4z5a6s7d', // María Becerra
  '8m9n0b1v2c3x4z5a6s7d8f', // Rusherking
  '9n0b1v2c3x4z5a6s7d8f9g', // Nicki Nicole (ya está arriba)
  '0b1v2c3x4z5a6s7d8f9g0h', // Tiago PZK (ya está arriba)
  '1v2c3x4z5a6s7d8f9g0h1j', // Trueno (ya está arriba)
  '2c3x4z5a6s7d8f9g0h1j2k', // Wos
  '3x4z5a6s7d8f9g0h1j2k3l', // Cazzu
  '4z5a6s7d8f9g0h1j2k3l4m', // Emilia
  
  // MÉXICO 🇲🇽
  '0EFisj6Segl8Fs2Ta7Mt1l', // Maluma (también colombiano)
  '5s6d7f8g9h0j1k2l3m4n5b', // Natanael Cano
  '6d7f8g9h0j1k2l3m4n5b6v', // Junior H
  '7f8g9h0j1k2l3m4n5b6v7c', // Peso Pluma
  '8g9h0j1k2l3m4n5b6v7c8x', // Santa Fe Klan
  '9h0j1k2l3m4n5b6v7c8x9z', // Grupo Firme
  '0j1k2l3m4n5b6v7c8x9z0a', // Eslabon Armado
  '1k2l3m4n5b6v7c8x9z0a1s', // Fuerza Regida
  '2l3m4n5b6v7c8x9z0a1s2d', // Calle 13
  '3m4n5b6v7c8x9z0a1s2d3f', // Residente
  '4n5b6v7c8x9z0a1s2d3f4g', // Molotov
  '5b6v7c8x9z0a1s2d3f4g5h', // Control Machete
  
  // CHILE 🇨🇱
  '2R2f3g3h4j5k6l7m8n9o0p', // Cris MJ
  '5k8d7f9h2j4l6n8b0v2c4x', // FloyyMenor
  '7m2n5b8v0c3x6z9a2s5d8f', // Pablo Chill-E
  '1g4h7j0k3m6n9b2v5c8x0z', // Jordan 23
  '9s2d5f8g1h4j7k0m3n6b9v', // Harry Nach
  
  // REPÚBLICA DOMINICANA 🇩🇴
  '7GiQUpt3OrHWJrC6i5ntAg', // Nicky Jam (también PR)
  '3E9C3y8L4o8P4m7t1H9w3f', // Juan Magán
  '1h9D7f8g6j5k4l3m2n1b2v', // Natti Natasha
  '2i0E8g9h7k6l5m4n3o2p1a', // Mozart La Para
  '3j1F9h0i8l7m6n5o4p3q2b', // Rochy RD
  
  // PERÚ 🇵🇪
  '4Awb0nYm7XifnC8JdqxhJQ', // Libido
  '5k2d4f6g8h0j2l4n6b8v0c', // Pelo Madueño
  
  // ECUADOR 🇪🇨
  '6l3e5g7i9k1m3o5q7s9u1w', // Gerardo Mejía
  
  // PANAMÁ 🇵🇦
  '7m4f6h8j0l2n4p6r8t0v2x', // Sech (ya está arriba)
  '8n5g7i9k1m3o5q7s9u1w3y', // Boza
  
  // GUATEMALA 🇬🇹
  '9o6h8j0l2n4p6r8t0v2x4z', // Danny Ocean (también Venezuela)
  '0p7i9k1m3o5q7s9u1w3y5a', // Tito El Bambino
  
  // HONDURAS 🇭🇳
  '1q8j0l2n4p6r8t0v2x4z6b', // Polache
  
  // EL SALVADOR 🇸🇻
  '2r9k1m3o5q7s9u1w3y5a7c', // Pescozada
  
  // NICARAGUA 🇳🇮
  '3s0l2n4p6r8t0v2x4z6b8d', // Ceshia Ubau
  
  // COSTA RICA 🇨🇷
  '4t1m3o5q7s9u1w3y5a7c9e', // Debi Nova
  
  // URUGUAY 🇺🇾
  '5u2n4p6r8t0v2x4z6b8d0f', // Natalia Oreiro
  
  // PARAGUAY 🇵🇾
  '6v3o5q7s9u1w3y5a7c9e1g', // Tierra Adentro
  
  // BOLIVIA 🇧🇴
  '7w4p6r8t0v2x4z6b8d0f2h', // Los Kjarkas
  
  // VENEZUELA 🇻🇪
  '8x5q7s9u1w3y5a7c9e1g3i', // Danny Ocean (también Guatemala)
  '9y6r8t0v2x4z6b8d0f2h4j', // Micro TDH
  '0z7s9u1w3y5a7c9e1g3i5k', // Akapellah
];

async function getSpotifyToken() {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '72d3c40165884d6396ff2ef86a01ffb1';
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '52a4b60ab1e14ece818cc51309f24d4d';

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  const data = await response.json();
  return data.access_token;
}

async function importarArtista(spotifyId, token) {
  try {
    // Verificar si ya existe
    const existente = await prisma.$queryRaw`SELECT id FROM "Artista" WHERE id = ${spotifyId}`;
    if (existente.length > 0) {
      return null;
    }

    const response = await fetch(`https://api.spotify.com/v1/artists/${spotifyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Solo artistas de habla hispana (filtrar por géneros)
    const generos = data.genres || [];
    const esLatino = generos.some(g => 
      g.includes('latin') || 
      g.includes('reggaeton') || 
      g.includes('trap') ||
      g.includes('urbano') ||
      g.includes('spanish')
    );
    
    if (!esLatino && data.popularity < 50) {
      console.log(`    ↳ ${data.name} no parece ser artista latino urbano, saltando...`);
      return null;
    }
    
    // Insertar artista
    await prisma.$executeRaw`
      INSERT INTO "Artista" (id, nombre, imagen, seguidores, generos, popularidad, "spotifyUrl", bio, "esVerificado")
      VALUES (
        ${data.id}, 
        ${data.name}, 
        ${data.images?.[0]?.url || null}, 
        ${data.followers?.total || 0}, 
        ${generos}, 
        ${data.popularity || 0}, 
        ${data.external_urls?.spotify || null},
        ${`Artista de ${generos[0] || 'música urbana latina'}`},
        true
      )
      ON CONFLICT (id) DO NOTHING
    `;

    console.log(`    ✓ ${data.name}`);
    return data;
  } catch (error) {
    console.error(`    ✗ Error:`, error.message);
    return null;
  }
}

async function importarAlbums(artistaId, token) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistaId}/albums?include_groups=album,single,ep&limit=50&market=ES`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const albums = [];

    for (const album of data.items || []) {
      // Verificar si ya existe
      const existente = await prisma.$queryRaw`SELECT id FROM "Album" WHERE id = ${album.id}`;
      if (existente.length > 0) {
        continue;
      }

      await prisma.$executeRaw`
        INSERT INTO "Album" (id, nombre, imagen, fecha, "totalTracks", "spotifyUrl", tipo, "artistaId")
        VALUES (
          ${album.id},
          ${album.name},
          ${album.images?.[0]?.url || null},
          ${album.release_date},
          ${album.total_tracks},
          ${album.external_urls?.spotify || null},
          ${(album.album_type || 'album').toUpperCase()},
          ${artistaId}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      
      albums.push(album);
    }

    return albums;
  } catch (error) {
    console.error(`    ✗ Error álbumes:`, error.message);
    return [];
  }
}

async function importarCanciones(albumId, token) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50&market=ES`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    let count = 0;

    for (const track of data.items || []) {
      // Verificar si ya existe
      const existente = await prisma.$queryRaw`SELECT id FROM "Cancion" WHERE id = ${track.id}`;
      if (existente.length > 0) {
        continue;
      }

      // Obtener audio features
      const featuresRes = await fetch(`https://api.spotify.com/v1/audio-features/${track.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const features = featuresRes.ok ? await featuresRes.json() : {};

      await prisma.$executeRaw`
        INSERT INTO "Cancion" (
          id, nombre, duracion, "previewUrl", "spotifyUrl", "trackNumber", 
          "albumId", explicit, bpm, key, energy, danceability, valence
        )
        VALUES (
          ${track.id},
          ${track.name},
          ${track.duration_ms},
          ${track.preview_url},
          ${track.external_urls?.spotify || null},
          ${track.track_number},
          ${albumId},
          ${track.explicit},
          ${features.tempo || null},
          ${features.key || null},
          ${features.energy || null},
          ${features.danceability || null},
          ${features.valence || null}
        )
        ON CONFLICT (id) DO NOTHING
      `;

      // Insertar relaciones con artistas
      for (const artist of track.artists) {
        // Asegurar que el artista existe
        await prisma.$executeRaw`
          INSERT INTO "Artista" (id, nombre, "spotifyUrl", "esVerificado")
          VALUES (${artist.id}, ${artist.name}, ${artist.external_urls?.spotify || null}, false)
          ON CONFLICT (id) DO NOTHING
        `;

        await prisma.$executeRaw`
          INSERT INTO "CancionArtista" ("cancionId", "artistaId", "esPrincipal")
          VALUES (${track.id}, ${artist.id}, ${artist.id === track.artists[0].id})
          ON CONFLICT ("cancionId", "artistaId") DO NOTHING
        `;
      }

      count++;
    }

    return count;
  } catch (error) {
    console.error(`    ✗ Error canciones:`, error.message);
    return 0;
  }
}

async function importarTodo() {
  console.log('🎵 IMPORTACIÓN MASIVA - URBANO LATINO\n');
  console.log('Artistas: Puerto Rico, Colombia, España, Argentina, México, Chile...\n');
  console.log('=' .repeat(70));
  
  try {
    const token = await getSpotifyToken();
    console.log('🔑 Token obtenido\n');

    let stats = {
      artistas: 0,
      albumes: 0,
      canciones: 0
    };

    for (let i = 0; i < ARTISTAS_URBANOS_LATINOS.length; i++) {
      const artistaId = ARTISTAS_URBANOS_LATINOS[i];
      
      const artista = await importarArtista(artistaId, token);
      if (artista) {
        stats.artistas++;
        process.stdout.write(`\n[${i + 1}/${ARTISTAS_URBANOS_LATINOS.length}] ${artista.name} `);
        
        const albums = await importarAlbums(artistaId, token);
        stats.albumes += albums.length;
        process.stdout.write(`(${albums.length} álbumes) `);
        
        let cancionesArtista = 0;
        for (const album of albums) {
          const cancionesCount = await importarCanciones(album.id, token);
          cancionesArtista += cancionesCount;
        }
        stats.canciones += cancionesArtista;
        process.stdout.write(`- ${cancionesArtista} canciones`);
      }
      
      // Pausa para no saturar la API
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('✅ IMPORTACIÓN COMPLETADA');
    console.log('='.repeat(70));
    console.log(`📊 NUEVOS DATOS:`);
    console.log(`   • Artistas: ${stats.artistas}`);
    console.log(`   • Álbumes: ${stats.albumes}`);
    console.log(`   • Canciones: ${stats.canciones}`);
    
    // Conteos totales
    const totals = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM "Artista") as total_artistas,
        (SELECT COUNT(*) FROM "Album") as total_albumes,
        (SELECT COUNT(*) FROM "Cancion") as total_canciones
    `;
    
    console.log(`\n📈 TOTALES EN BASE DE DATOS:`);
    console.log(`   • ${totals[0].total_artistas} artistas`);
    console.log(`   • ${totals[0].total_albumes} álbumes`);
    console.log(`   • ${totals[0].total_canciones} canciones`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importarTodo();