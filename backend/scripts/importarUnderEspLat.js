import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// UNDERGROUND ESPAÑA - Trap, Rap, R&B Español
const UNDER_ESPAÑA = [
  // TRAP ESPAÑA
  'Yung Beef', 'Kaydy Cain', 'Khaled', 'Pxxr Gvng', 'Los Zafiros',
  'Fernandéz', 'Xiyi', 'Bea Pelea', 'Rusowsky', 'Carolina Durante',
  'Naked Giants', 'Lil Spain', 'Pavvla', 'Putochinomaricón', 'Cariño',
  'Belako', 'Biznaga', 'Junglan', 'Pedro LaDroga', 'Sule B',
  'Don Patricio', 'Polimá Westcoast', 'Paloma Mami', 'C. Tangana',
  'Nathy Peluso', 'Ms Nina', 'La Zowi', 'Javiera Mena', 'Alizzz',
  'Cruz Cafuné', 'Maikel Delacalle', 'Tomasito', 'Lola Indigo',
  'Mimi', 'Dora', 'Hoke', 'Morad', 'Soto Asa', 'Bejo',
  'Cookin Soul', 'Cruz Cafuné', 'Toulouse', 'Los Nikis',
  'Lalo Ebratt', 'Trapical', 'Mala Vida', 'Los Peces', 'Poles',
  'Mdnag', 'Mauro Lombardo', 'Asan', 'Lucho SSJ', 'Yesan',
  'Saramalacara', 'Duketo', 'Pekeño 77', 'Ysy A', 'Bhavi',
  'Neo Pistea', 'Tobi', 'Khea', 'C.R.O', 'Alemán',
  'Paco Amoroso', 'CA7RIEL', 'Dellafuente', 'Kidd Keo',
  'Skinny Flakk', '31 FAM', 'Gym Class', '412', '31TB',
  'Lil Moss', 'Bejo', 'Sule B', 'Foyone', 'Dano',
  'Ayax y Prok', 'Rels B', 'Delaossa', 'Eugenio', 'Costa',
  'Toteking', 'Shotta', 'Elphomega', 'Nach', 'Kase O',
  'Violadores del Verso', 'SFDK', 'ToteKing', 'Foyone',
  
  // R&B/Soul España
  'Sen Senra', 'Niña Polaca', 'Bely Basarte', 'Aitana',
  'Lola Indigo', 'Mala Rodríguez', 'Nathy Peluso',
  
  // INDIE/ALTERNATIVO ESPAÑA
  'Carolina Durante', 'Naked Giants', 'Ginebras', 'Lori Meyers',
  'Supersubmarina', 'Dorian', 'Miss Caffeina', 'Sidonie',
  'Vetusta Morla', 'Izal', 'Love of Lesbian', 'Second',
  'Dinero', 'Toundra', 'Exquirla', 'Los Planetas',
  'La Casa Azul', 'Electrodomésticos', 'Family Shop',
  'Viva Suecia', 'Arde Bogotá', 'Biznaga', 'Hinds',
  'Belako', 'Cariño', 'Putochinomaricón', 'La Zowi',
  'Ms Nina', 'Dora Band', 'Mimi', 'Lola Indigo',
  'El Mató a un Policía Motorizado', 'Babasónicos',
  'Soda Stereo', 'Los Prisioneros', 'Los Tres', 'Chancho en Piedra',
  'Callejeros', 'Los Piojos', 'Los Auténticos Decadentes',
  'Los Fabulosos Cadillacs', 'Virus', 'Enanitos Verdes',
  'Sui Generis', 'Serú Girán', 'Luis Alberto Spinetta',
  'Charly García', 'Fito Páez', 'Andrés Calamaro',
  'Gustavo Cerati', 'Soda Stereo', 'Los Enanitos Verdes'
];

// UNDERGROUND LATINOAMÉRICA
const UNDER_LATAM = [
  // ARGENTINA
  'Duki', 'Neo Pistea', 'Ysy A', 'C.R.O', 'Khea', 'Bhad Bunny',
  'Midas', 'Rusherking', 'Mesita', 'Lucho SSJ', 'Marcianos Crew',
  'Milo J', 'Stuart', 'Bizarrap', 'Trueno', 'Wos', 'Cazzu',
  'Nicki Nicole', 'Tiago PZK', 'Emilia', 'María Becerra', 'Tini',
  'Conociendo Rusia', 'Barbi Recanati', 'Louta', 'Nicolás Jaar',
  'Talisto', 'Saramalacara', 'Dillom', 'Paco Amoroso', 'CA7RIEL',
  'Paulo Londra', 'Khea', 'C.R.O', 'Alemán', 'Paco Amoroso',
  'CA7RIEL', 'Nathy Peluso', 'Emilia', 'Tiago PZK',
  'YSY A', 'Bhavi', 'Neo Pistea', 'Tobi', 'KHEA',
  'Duki', 'Trueno', 'Wos', 'Cazzu', 'Nicki Nicole',
  
  // CHILE
  'Cris MJ', 'Pablo Chill-E', 'FloyyMenor', 'Jordan 23', 'Harry Nach',
  'Polimá Westcoast', 'Paloma Mami', 'Princesa Alba', 'Rubio',
  'Alemán', 'Young Cister', 'Dr. Vades', 'Charly Benavente',
  'Pánico', 'Ases Falsos', 'Drefquila', 'Trecho', 'Nickoog Clk',
  'Simon la Letra', 'Stailok', 'ByJ', 'Gianluca', 'Killua97',
  
  // COLOMBIA
  'Ryan Castro', 'Blessd', 'Pirlo', 'Yandar', 'Yostin', 
  'Andy Rivera', 'Nacho', 'Kevin Roldán', 'Juanes', 'Maluma',
  'Feid', 'Karol G', 'J Balvin', 'Sebastián Yatra', 'Camilo',
  'Ovy On The Drums', 'Mosty', 'Piso 21', 'Pasabordo', 'Alkilados',
  'Pasaporte', 'Kapo', 'Humbe', 'Gabriel Garzón-Montano',
  
  // PUERTO RICO / REGGAETON UNDER
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
  'Edén Muñoz', 'Los Dareyes de la Sierra', 'El Fantasma',
  
  // REPÚBLICA DOMINICANA / DEMBOW
  'Rochy RD', 'Chimbala', 'El Alfa', 'El Mayor Clasico', 'Mark B',
  'Quimico Ultra Mega', 'Bulova', 'Tivi Gunz', 'Nfasis', 'Amara La Negra',
  'Mozart La Para', 'Black Point', 'La Materialista', 'La Insuperable',
  'Tokischa', 'Yailin La Mas Viral', 'Tekashi 6ix9ine',
  
  // PERÚ / ECUADOR / VENEZUELA / BOLIVIA
  'Micro TDH', 'Ak420', 'Danny Ocean', 'Nach', 'Mala Rodríguez',
  'Kase O', 'Violadores del Verso', 'SFDK',
  
  // OTROS UNDER LATINO
  'Danny Ocean', 'Micro TDH', 'Ak420'
];

async function getSpotifyToken() {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

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
    const existente = await prisma.$queryRaw`SELECT id FROM "Artista" WHERE id = ${artistaData.id}`;
    if (existente.length > 0) {
      console.log(`   ⚠️ ${artistaData.name} ya existe`);
      return false;
    }

    const generos = artistaData.genres || [];
    const generosFormateados = generos.length > 0 
      ? `ARRAY[${generos.map(g => `'${g.replace(/'/g, "''")}'`).join(',')}]::text[]`
      : 'ARRAY[]::text[]';

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
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function importarLista(artistas, nombreLista, token) {
  console.log(`\n🎤 ${nombreLista} (${artistas.length} artistas)\n`);
  
  let importados = 0;
  for (let i = 0; i < artistas.length; i++) {
    const nombre = artistas[i];
    process.stdout.write(`[${i + 1}/${artistas.length}] ${nombre}... `);
    
    const data = await buscarArtista(nombre, token);
    if (!data) {
      console.log('❌ no encontrado');
      continue;
    }
    
    const ok = await importarArtista(data);
    if (ok) importados++;
    
    await new Promise(r => setTimeout(r, 150));
  }
  
  return importados;
}

async function main() {
  console.log('🚀 IMPORTANDO UNDERGROUND ESPAÑOL Y LATINO\n');
  console.log('=' .repeat(70));
  
  try {
    const token = await getSpotifyToken();
    
    const total1 = await importarLista(UNDER_ESPAÑA, 'UNDERGROUND ESPAÑA', token);
    const total2 = await importarLista(UNDER_LATAM, 'UNDERGROUND LATINOAMÉRICA', token);
    
    const totales = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "Artista"`;
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN:');
    console.log(`   • España importados: ${total1}`);
    console.log(`   • Latinoamérica importados: ${total2}`);
    console.log(`   • TOTAL EN BD: ${totales[0].total} artistas`);
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();