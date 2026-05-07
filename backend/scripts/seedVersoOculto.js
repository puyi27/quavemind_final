import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Versos de ejemplo para el juego
const VERSOS_EJEMPLO = [
  {
    cancionId: '1IHWl5LamUGEuP4vKdpPSd', // Tití Me Preguntó
    verso: 'Tití me preguntó si tengo mucha novia',
    inicioVerso: 0,
    finVerso: 44,
    pistaArtista: 'Artista de Puerto Rico, conejo malo',
    pistaAnio: 2022,
    pistaAlbum: 'Un Verano Sin Ti',
    dificultad: 1,
  },
  {
    cancionId: '1IHWl5LamUGEuP4vKdpPSd',
    verso: 'Me la voy a llevar a la Zona Paraíso',
    inicioVerso: 115,
    finVerso: 156,
    pistaArtista: 'Artista de Puerto Rico',
    pistaAnio: 2022,
    pistaAlbum: null, // Más difícil
    dificultad: 3,
  },
  {
    cancionId: '3iUl9MtxNW8F5RrQBlWrab', // Columbia
    verso: 'Columbia, Columbia, desde que llegué a Canarias me siento en Colombia',
    inicioVerso: 0,
    finVerso: 71,
    pistaArtista: 'Artista canario, BZRP Session #52',
    pistaAnio: 2023,
    pistaAlbum: null,
    dificultad: 2,
  },
  {
    cancionId: '7dSZ6j9lKkXhE3h9Kme7k7', // Provenza
    verso: 'Si tú me llamas, nos vamo pa Provenza',
    inicioVerso: 0,
    finVerso: 41,
    pistaArtista: 'Artista colombiana, la Bichota',
    pistaAnio: 2022,
    pistaAlbum: 'MAÑANA SERÁ BONITO',
    dificultad: 2,
  },
  {
    cancionId: '7dSZ6j9lKkXhE3h9Kme7k7',
    verso: 'Que la vida es una, hay que vivirla ahora',
    inicioVerso: 100,
    finVerso: 144,
    pistaArtista: 'Artista colombiana',
    pistaAnio: 2022,
    pistaAlbum: null,
    dificultad: 4,
  },
];

async function seed() {
  console.log('🎤 Iniciando seed de Verso Oculto...\n');

  try {
    // Verificar que existan las canciones
    const cancionesExistentes = await prisma.cancion.findMany({
      select: { id: true, nombre: true },
    });

    console.log('Canciones en la base de datos:');
    cancionesExistentes.forEach(c => console.log(`  • ${c.nombre} (${c.id})`));

    console.log('\n📜 Insertando versos...\n');

    let insertados = 0;
    let saltados = 0;

    for (const versoData of VERSOS_EJEMPLO) {
      // Verificar si la canción existe
      const cancionExiste = cancionesExistentes.find(c => c.id === versoData.cancionId);
      
      if (!cancionExiste) {
        console.log(`⚠️ Saltando (canción no encontrada): ${versoData.verso.substring(0, 30)}...`);
        saltados++;
        continue;
      }

      // Crear o actualizar verso
      await prisma.pistaVersoOculto.upsert({
        where: {
          id: `verso_${versoData.cancionId}_${versoData.inicioVerso}`,
        },
        update: {},
        create: {
          id: `verso_${versoData.cancionId}_${versoData.inicioVerso}`,
          ...versoData,
        },
      });

      console.log(`✓ ${versoData.verso.substring(0, 40)}... (Dificultad: ${versoData.dificultad})`);
      insertados++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ SEED DE VERSO OCULTO COMPLETADO');
    console.log('='.repeat(50));
    console.log(`📊 RESUMEN:`);
    console.log(`   • Versos insertados: ${insertados}`);
    console.log(`   • Saltados: ${saltados}`);
    console.log(`   • Total en BD: ${await prisma.pistaVersoOculto.count()}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Error en el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();