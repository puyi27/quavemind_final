import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Lista de artistas prioritarios (los más importantes)
const ARTISTAS_PRIORITARIOS = [
  'Bad Bunny', 'Karol G', 'Feid', 'Mora', 'Eladio Carrión',
  'Myke Towers', 'Rauw Alejandro', 'Sech', 'Dalex', 'Arcángel',
  'Anuel AA', 'Ozuna', 'Daddy Yankee', 'Nicky Jam', 'Farruko',
  'J Balvin', 'Maluma', 'Shakira', 'Camilo', 'Sebastián Yatra',
  'Peso Pluma', 'Natanael Cano', 'Junior H', 'Fuerza Regida',
  'Eslabon Armado', 'Santa Fe Klan', 'Grupo Firme',
  'Quevedo', 'Duki', 'C. Tangana', 'Nathy Peluso',
  'Cazzu', 'Nicki Nicole', 'Tiago PZK', 'Emilia', 'Tini',
  'Bizarrap', 'Trueno', 'Wos', 'Paulo Londra', 'Khea',
  'Drake', 'Kendrick Lamar', 'Travis Scott', 'Future', 'Metro Boomin',
  '21 Savage', 'J. Cole', 'Lil Baby', 'DaBaby', 'Migos',
  'Cardi B', 'Megan Thee Stallion', 'Nicki Minaj', 'Doja Cat',
  'Lil Nas X', 'Tyler The Creator', 'ASAP Rocky', 'Kanye West',
  'Jay-Z', 'Eminem', 'Snoop Dogg', 'Ice Cube', 'Dr. Dre'
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

async function buscarArtista(nombre, token) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(nombre)}&type=artist&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.artists?.items?.[0];
  } catch (error) {
    return null;
  }
}

async function importarArtista(artistaData) {
  try {
    // Verificar si ya existe
    const existente = await prisma.$queryRaw`SELECT id FROM "Artista" WHERE id = ${artistaData.id}`;
    if (existente.length > 0) {
      console.log(`   ⚠️ ${artistaData.name} ya existe`);
      return false;
    }

    // Formatear géneros para PostgreSQL
    const generos = artistaData.genres || [];
    const generosFormateados = generos.length > 0 
      ? `ARRAY[${generos.map(g => `'${g.replace(/'/g, "''")}'`).join(',')}]::text[]`
      : 'ARRAY[]::text[]';

    // Insertar artista
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Artista" (id, nombre, imagen, seguidores, generos, popularidad, "spotifyUrl", "esVerificado")
      VALUES (
        '${artistaData.id}', 
        '${artistaData.name.replace(/'/g, "''")}', 
        ${artistaData.images?.[0]?.url ? `'${artistaData.images[0].url}'` : 'NULL'}, 
        ${artistaData.followers?.total || 0}, 
        ${generosFormateados}, 
        ${artistaData.popularity || 0}, 
        ${artistaData.external_urls?.spotify ? `'${artistaData.external_urls.spotify}'` : 'NULL'},
        ${artistaData.popularity > 60}
      )
      ON CONFLICT (id) DO NOTHING
    `);

    console.log(`   ✅ ${artistaData.name} importado`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error importando ${artistaData.name}:`, error.message);
    return false;
  }
}

async function importarMasivo() {
  console.log('🚀 IMPORTACIÓN MASIVA DE ARTISTAS\n');
  console.log(`Importando ${ARTISTAS_PRIORITARIOS.length} artistas...\n`);
  console.log('=' .repeat(60));

  try {
    const token = await getSpotifyToken();
    console.log('✅ Token obtenido\n');

    let importados = 0;
    let errores = 0;

    for (let i = 0; i < ARTISTAS_PRIORITARIOS.length; i++) {
      const nombre = ARTISTAS_PRIORITARIOS[i];
      console.log(`[${i + 1}/${ARTISTAS_PRIORITARIOS.length}] Buscando: ${nombre}...`);

      const artistaData = await buscarArtista(nombre, token);
      
      if (!artistaData) {
        console.log(`   ❌ No encontrado`);
        errores++;
        continue;
      }

      const resultado = await importarArtista(artistaData);
      if (resultado) importados++;

      // Esperar 100ms entre cada artista para no saturar la API
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADOS:');
    console.log(`   • Artistas buscados: ${ARTISTAS_PRIORITARIOS.length}`);
    console.log(`   • Importados nuevos: ${importados}`);
    console.log(`   • Errores/No encontrados: ${errores}`);

    // Verificar totales
    const totales = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "Artista"`;
    console.log(`\n📈 TOTAL EN BASE DE DATOS: ${totales[0].total} artistas`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importarMasivo();