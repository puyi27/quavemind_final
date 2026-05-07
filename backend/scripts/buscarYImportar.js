import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// LISTA MASIVA DE ARTISTAS - UNDER / NEW WAVE / OLD SCHOOL
const ARTISTAS_BUSCAR = [
  // NEW WAVE UNDER ESPAÑA
  'Yung Beef', 'Kaydy Cain', 'Khaled', 'Pxxr Gvng', 'Los Zafiros', 
  'Fernandéz', 'Xiyi', 'Bea Pelea', 'Rusowsky', 'Carolina Durante',
  'Naked Giants', 'Lil Spain', 'Pavvla', 'Putochinomaricón', 'Cariño',
  'Belako', 'Biznaga', 'Junglan', 'Pedro LaDroga', 'Sule B',
  'Don Patricio', 'Polimá Westcoast', 'Paloma Mami', 'C. Tangana',
  'Nathy Peluso', 'Ms Nina', 'La Zowi', 'Javiera Mena', 'Alizzz',
  
  // NEW WAVE UNDER ARGENTINA
  'Duki', 'Neo Pistea', 'Ysy A', 'C.R.O', 'Khea', 'Bhad Bunny',
  'Midas', 'Rusherking', 'Mesita', 'Lucho SSJ', 'Marcianos Crew',
  'Milo J', 'Stuart', 'Bizarrap', 'Trueno', 'Wos', 'Cazzu',
  'Nicki Nicole', 'Tiago PZK', 'Emilia', 'María Becerra', 'Tini',
  'Conociendo Rusia', 'Barbi Recanati', 'Louta', 'Nicolás Jaar',
  'Talisto', 'Saramalacara', 'Dillom', 'Paco Amoroso', 'CA7RIEL',
  
  // CHILE UNDER
  'Cris MJ', 'Pablo Chill-E', 'FloyyMenor', 'Jordan 23', 'Harry Nach',
  'Polimá Westcoast', 'Paloma Mami', 'Princesa Alba', 'Rubio',
  'Alemán', 'Young Cister', 'Dr. Vades', 'Charly Benavente',
  'Pánico', 'Ases Falsos', 'Drefquila', 'Trecho', 'Nickoog Clk',
  'Simon la Letra', 'Stailok', 'ByJ', 'Gianluca', 'Killua97',
  
  // COLOMBIA UNDER
  'Ryan Castro', 'Blessd', 'Pirlo', 'Yandar', 'Yostin', 
  'Andy Rivera', 'Nacho', 'Kevin Roldán', 'Juanes', 'Maluma',
  'Feid', 'Karol G', 'J Balvin', 'Sebastián Yatra', 'Camilo',
  'Ovy On The Drums', 'Mosty', 'Piso 21', 'Pasabordo', 'Alkilados',
  'Pasaporte', 'Kapo', 'Humbe', 'Gabriel Garzón-Montano',
  
  // PUERTO RICO UNDER
  'Myke Towers', 'Eladio Carrión', 'Mora', 'Rauw Alejandro',
  'Feid', 'Sech', 'Dalex', 'Lenny Tavárez', 'Brytiago',
  'Noriel', 'Lunay', 'Jay Wheeler', 'Arcángel', 'De La Ghetto',
  'Ñengo Flow', 'Jowell & Randy', 'Wisin & Yandel', 'Don Omar',
  'Zion & Lennox', 'Tego Calderón', 'Calle 13', 'Residente',
  'Bad Bunny', 'Anuel AA', 'Ozuna', 'Daddy Yankee', 'Nicky Jam',
  'Farruko', 'Justin Quiles', 'Miky Woodz', 'Jamby El Favo',
  
  // MÉXICO UNDER / REGIONAL URBANO
  'Natanael Cano', 'Junior H', 'Peso Pluma', 'Santa Fe Klan',
  'Fuerza Regida', 'Eslabon Armado', 'Grupo Firme', 'Calibre 50',
  'Gerardo Ortiz', 'Alfredo Olivas', 'Luis R Conriquez', 'Oscar Maydon',
  'Ovi', 'Tito Double P', 'Chino Pacas', 'Dannylux', 'Yahritza',
  'Xavi', 'Gabito Ballesteros', 'Codiciado', 'Armenta', 'Bélico',
  'Adriel Favela', 'Los Hijos de Garcia', 'Marca MP', 'Grupo Marca Registrada',
  'Edén Muñoz', 'Eslabón Armado', 'Los Dareyes de la Sierra', 'El Fantasma',
  
  // REPÚMPLICA DOMINICANA / DEMBOW
  'Rochy RD', 'Chimbala', 'El Alfa', 'El Mayor Clasico', 'Mark B',
  'Quimico Ultra Mega', 'Bulova', 'Tivi Gunz', 'Nfasis', 'Amara La Negra',
  'Mozart La Para', 'Black Point', 'La Materialista', 'La Insuperable',
  'Tokischa', 'Yailin La Mas Viral', 'Tekashi 6ix9ine', 'Anuel AA',
  
  // UNDER GENERAL LATINO
  'Micro TDH', 'Ak420', 'Danny Ocean', 'Nach', 'Mala Rodríguez',
  'Kase O', 'Violadores del Verso', 'SFDK', 'Toteking', 'Shotta',
  'Elphomega', 'Eugenio', 'Costa', 'Rels B', 'Delaossa',
  'Ayax y Prok', 'Dano', 'ToteKing', 'Foyone', 'Sule B',
  'Bejo', 'Cookin Soul', 'Alizzz', 'La Vida Bohème', 'Los Colores',
  'Bandalos Chinos', 'El Mató a un Policía Motorizado', 'Babasónicos',
  'Soda Stereo', 'Los Prisioneros', 'Los Tres', 'Chancho en Piedra',
  'Callejeros', 'Los Piojos', 'Los Auténticos Decadentes', 'Los Fabulosos Cadillacs',
  'Virus', 'Enanitos Verdes', 'Sui Generis', 'Serú Girán', 'Spinetta',
  'Charly García', 'Fito Páez', 'Andrés Calamaro', 'Gustavo Cerati',
  'Soda Stereo', 'Los Enanitos Verdes', 'Los Prisioneros', 'Los Tres',
  
  // TRAP LATINO OLD SCHOOL
  'Cosculluela', 'Kendo Kaponi', 'J Álvarez', 'Ñejo', 'Dalmata',
  'Jowell & Randy', 'De La Ghetto', 'Zion', 'Lennox', 'Arcángel',
  'Ñengo Flow', 'Yomo', 'Guelo Star', 'Julio Voltio', 'Tego Calderón',
  'Don Omar', 'Wisin & Yandel', 'Ivy Queen', 'Zion & Lennox',
  'Héctor el Father', 'Tito El Bambino', 'Daddy Yankee', 'Nicky Jam',
  
  // REGGAETON UNDER ACTUAL
  'Brray', 'Nio Garcia', 'Juanka', 'Jerry Di', 'Omar Courtz',
  'Dei V', 'Luar La L', 'Ankhal', 'Yovngchimi', 'Yan Block',
  'Hades66', 'Anuel AA', 'Ozuna', 'Karol G', 'Feid',
  'Mora', 'Eladio Carrión', 'Myke Towers', 'Rauw Alejandro',
  'Sech', 'Dalex', 'Arcángel', 'Ñengo Flow', 'Jowell & Randy',
  
  // JC REYES Y SIMILARES
  'JC Reyes', 'Morad', 'Soto Asa', 'Bejo', 'Cookin Soul',
  'Alizzz', 'Cruz Cafuné', 'Maikel Delacalle', 'Tomasito',
  'Toulouse', 'Los Nikis', 'Der Klassiker', 'Lalo Ebratt',
  'Trapical', 'Mala Vida', 'Los Peces', 'Poles', 'Mdnag',
  
  // TRAP ARGENTINO ESPECÍFICO
  'Mauro Lombardo', 'Asan', 'Lucho SSJ', 'Yesan', 'Saramalacara',
  'Duketo', 'Pekeño 77', 'Ysy A', 'Bhavi', 'Neo Pistea',
  'Tobi', 'Khea', 'C.R.O', 'Alemán', 'Paco Amoroso',
  'CA7RIEL', 'Nathy Peluso', 'Nicki Nicole', 'Emilia', 'Tiago PZK',
  
  // MÁS UNDER ESPAÑA
  'Hoke', 'Morad', 'Soto Asa', 'Bejo', 'Cookin Soul',
  'Lola Indigo', 'Mimi', 'Dora', 'Ms Nina', 'La Zowi',
  'Putochinomaricón', 'Cariño', 'Belako', 'Hinds', 'Biznaga',
  'Viva Suecia', 'Arde Bogotá', 'Carolina Durante', 'Naked Giants',
  'Ginebras', 'Lori Meyers', 'Supersubmarina', 'Dorian', 'Miss Caffeina',
  'Sidonie', 'Lori Meyers', 'Vetusta Morla', 'Izal', 'Love of Lesbian',
  'Second', 'Dinero', 'Toundra', 'Exquirla', 'Los Planetas',
  
  // OTROS PAÍSES
  'Gloria Groove', 'Pabllo Vittar', 'Ludmilla', 'Anitta', 'MC Kevin',
  'MC Hariel', 'MC Ryan SP', 'MC Pedrinho', 'MC Poze do Rodo',
  'Rauw Alejandro', 'Dalex', 'Sech', 'Eladio Carrión', 'Mora',
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
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(nombre)}&type=artist&limit=3&market=ES`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const artistas = data.artists?.items || [];
    
    // Buscar coincidencia exacta o muy similar
    const match = artistas.find(a => 
      a.name.toLowerCase() === nombre.toLowerCase() ||
      a.name.toLowerCase().includes(nombre.toLowerCase())
    );
    
    return match || artistas[0];
  } catch (error) {
    return null;
  }
}

async function importarArtista(spotifyId, token) {
  try {
    // Verificar si ya existe
    const existente = await prisma.$queryRaw`SELECT id FROM "Artista" WHERE id = ${spotifyId}`;
    if (existente.length > 0) {
      return { yaExiste: true };
    }

    const response = await fetch(`https://api.spotify.com/v1/artists/${spotifyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    const data = await response.json();

    // Formatear géneros para PostgreSQL
    const generos = data.genres || [];
    const generosFormateados = generos.length > 0 
      ? `ARRAY[${generos.map(g => `'${g.replace(/'/g, "''")}'`).join(',')}]`
      : 'ARRAY[]::text[]';

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Artista" (id, nombre, imagen, seguidores, generos, popularidad, "spotifyUrl", bio, "esVerificado")
      VALUES (
        '${data.id}', 
        '${data.name.replace(/'/g, "''")}', 
        ${data.images?.[0]?.url ? `'${data.images[0].url}'` : 'NULL'}, 
        ${data.followers?.total || 0}, 
        ${generosFormateados}, 
        ${data.popularity || 0}, 
        ${data.external_urls?.spotify ? `'${data.external_urls.spotify}'` : 'NULL'},
        '${`Artista de ${data.genres?.[0] || 'música urbana'}`.replace(/'/g, "''")}',
        ${data.popularity > 60}
      )
      ON CONFLICT (id) DO NOTHING
    `);

    return { data, nuevo: true };
  } catch (error) {
    console.error(`   Error importando artista ${spotifyId}:`, error.message);
    return null;
  }
}

async function importarAlbums(artistaId, token) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistaId}/albums?include_groups=album,single,ep&limit=50&market=ES`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const albums = [];

    for (const album of data.items || []) {
      const existente = await prisma.$queryRaw`SELECT id FROM "Album" WHERE id = ${album.id}`;
      if (existente.length > 0) continue;

      await prisma.$executeRaw`
        INSERT INTO "Album" (id, nombre, imagen, fecha, "totalTracks", "spotifyUrl", tipo, "artistaId")
        VALUES (
          ${album.id}, ${album.name}, ${album.images?.[0]?.url || null},
          ${album.release_date}, ${album.total_tracks},
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
    return [];
  }
}

async function importarCanciones(albumId, token) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50&market=ES`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return 0;

    const data = await response.json();
    let count = 0;

    for (const track of data.items || []) {
      const existente = await prisma.$queryRaw`SELECT id FROM "Cancion" WHERE id = ${track.id}`;
      if (existente.length > 0) continue;

      const featuresRes = await fetch(
        `https://api.spotify.com/v1/audio-features/${track.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const features = featuresRes.ok ? await featuresRes.json() : {};

      await prisma.$executeRaw`
        INSERT INTO "Cancion" (
          id, nombre, duracion, "previewUrl", "spotifyUrl", "trackNumber", 
          "albumId", explicit, bpm, key, energy, danceability, valence
        )
        VALUES (
          ${track.id}, ${track.name}, ${track.duration_ms},
          ${track.preview_url}, ${track.external_urls?.spotify || null},
          ${track.track_number}, ${albumId}, ${track.explicit},
          ${features.tempo || null}, ${features.key || null},
          ${features.energy || null}, ${features.danceability || null},
          ${features.valence || null}
        )
        ON CONFLICT (id) DO NOTHING
      `;

      // Relaciones
      for (const artist of track.artists) {
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
    return 0;
  }
}

async function buscarEImportar() {
  console.log('🔥 IMPORTACIÓN MASIVA - UNDER / NEW WAVE / OLD SCHOOL\n');
  console.log(`Buscando ${ARTISTAS_BUSCAR.length} artistas...\n`);
  console.log('=' .repeat(70));

  try {
    const token = await getSpotifyToken();
    console.log('✓ Token obtenido\n');

    let stats = { encontrados: 0, importados: 0, albumes: 0, canciones: 0 };
    let noEncontrados = [];

    for (let i = 0; i < ARTISTAS_BUSCAR.length; i++) {
      const nombre = ARTISTAS_BUSCAR[i];
      process.stdout.write(`[${i + 1}/${ARTISTAS_BUSCAR.length}] Buscando: ${nombre}... `);

      const artistaSpotify = await buscarArtista(nombre, token);
      
      if (!artistaSpotify) {
        console.log('❌ No encontrado');
        noEncontrados.push(nombre);
        continue;
      }

      stats.encontrados++;
      process.stdout.write(`✓ ${artistaSpotify.name} `);

      const resultado = await importarArtista(artistaSpotify.id, token);
      
      if (resultado?.yaExiste) {
        console.log('(ya existe)');
        continue;
      }

      if (resultado?.nuevo) {
        stats.importados++;
        const albums = await importarAlbums(artistaSpotify.id, token);
        stats.albumes += albums.length;
        process.stdout.write(`${albums.length} álbumes `);

        let cancionesArtista = 0;
        for (const album of albums) {
          const count = await importarCanciones(album.id, token);
          cancionesArtista += count;
        }
        stats.canciones += cancionesArtista;
        console.log(`${cancionesArtista} canciones`);
      }

      // Pausa para no saturar la API
      await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ IMPORTACIÓN COMPLETADA');
    console.log('='.repeat(70));
    console.log(`📊 RESULTADOS:`);
    console.log(`   • Artistas buscados: ${ARTISTAS_BUSCAR.length}`);
    console.log(`   • Encontrados: ${stats.encontrados}`);
    console.log(`   • Importados nuevos: ${stats.importados}`);
    console.log(`   • Álbumes: ${stats.albumes}`);
    console.log(`   • Canciones: ${stats.canciones}`);
    
    if (noEncontrados.length > 0) {
      console.log(`\n⚠️  No encontrados (${noEncontrados.length}):`);
      console.log('   ' + noEncontrados.slice(0, 10).join(', ') + (noEncontrados.length > 10 ? '...' : ''));
    }

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

buscarEImportar();