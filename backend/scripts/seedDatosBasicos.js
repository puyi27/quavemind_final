import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const DATOS_EJEMPLO = {
  artistas: [
    {
      id: '4q3ewBCwI0LHTlucSPPTu6',
      nombre: 'Bad Bunny',
      imagen: 'https://i.scdn.co/image/ab6761610000e5eb8ee9a6e25e307649d5b4307a',
      seguidores: 65000000,
      generos: ['reggaeton', 'latin', 'trap latino'],
      popularidad: 98,
      spotifyUrl: 'https://open.spotify.com/artist/4q3ewBCwI0LHTlucSPPTu6',
      bio: 'Benito Antonio Martínez Ocasio, conocido artísticamente como Bad Bunny, es un cantante, compositor y actor puertorriqueño. Es considerado uno de los artistas más influyentes del reggaetón y la música urbana latina.',
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
      bio: 'Carolina Giraldo Navarro, conocida como Karol G, es una cantante y compositora colombiana. Es una de las artistas femeninas más importantes del reggaetón y la música urbana latina.',
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
      bio: 'Pedro Luis Domínguez Quevedo, conocido como Quevedo, es un cantante español de reggaetón y trap que saltó a la fama con su colaboración en "BZRP Music Sessions #52".',
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
};

async function seed() {
  console.log('🚀 Iniciando seed de datos básicos...\n');

  try {
    // Insertar artistas
    console.log('📀 Insertando artistas...');
    for (const artista of DATOS_EJEMPLO.artistas) {
      await prisma.artista.upsert({
        where: { id: artista.id },
        update: {},
        create: artista,
      });
      console.log(`✓ ${artista.nombre}`);
    }

    // Insertar álbumes
    console.log('\n💿 Insertando álbumes...');
    for (const album of DATOS_EJEMPLO.albumes) {
      await prisma.album.upsert({
        where: { id: album.id },
        update: {},
        create: album,
      });
      console.log(`✓ ${album.nombre}`);
    }

    // Insertar canciones
    console.log('\n🎵 Insertando canciones...');
    for (const cancion of DATOS_EJEMPLO.canciones) {
      await prisma.cancion.upsert({
        where: { id: cancion.id },
        update: {},
        create: cancion,
      });
      console.log(`✓ ${cancion.nombre}`);
    }

    // Relacionar canciones con artistas
    console.log('\n🔗 Creando relaciones canción-artista...');
    
    // Tití Me Preguntó - Bad Bunny
    await prisma.cancionArtista.upsert({
      where: {
        cancionId_artistaId: {
          cancionId: '1IHWl5LamUGEuP4vKdpPSd',
          artistaId: '4q3ewBCwI0LHTlucSPPTu6',
        }
      },
      update: {},
      create: {
        cancionId: '1IHWl5LamUGEuP4vKdpPSd',
        artistaId: '4q3ewBCwI0LHTlucSPPTu6',
        esPrincipal: true,
      },
    });

    // Columbia - Quevedo
    await prisma.cancionArtista.upsert({
      where: {
        cancionId_artistaId: {
          cancionId: '3iUl9MtxNW8F5RrQBlWrab',
          artistaId: '716NhGYqMbp3rsDPZJ3FYe',
        }
      },
      update: {},
      create: {
        cancionId: '3iUl9MtxNW8F5RrQBlWrab',
        artistaId: '716NhGYqMbp3rsDPZJ3FYe',
        esPrincipal: true,
      },
    });

    // Provenza - Karol G
    await prisma.cancionArtista.upsert({
      where: {
        cancionId_artistaId: {
          cancionId: '7dSZ6j9lKkXhE3h9Kme7k7',
          artistaId: '1pQWsZQehhS4wavwh7Fnxd',
        }
      },
      update: {},
      create: {
        cancionId: '7dSZ6j9lKkXhE3h9Kme7k7',
        artistaId: '1pQWsZQehhS4wavwh7Fnxd',
        esPrincipal: true,
      },
    });

    // Insertar letras
    console.log('\n📝 Insertando letras...');
    for (const letra of DATOS_EJEMPLO.letras) {
      await prisma.letra.upsert({
        where: { cancionId: letra.cancionId },
        update: {},
        create: letra,
      });
      const cancion = await prisma.cancion.findUnique({
        where: { id: letra.cancionId },
      });
      console.log(`✓ Letra de: ${cancion?.nombre}`);
    }

    // Crear usuario admin
    console.log('\n👤 Creando usuario admin...');
    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@quavemind.com' },
      update: {},
      create: {
        alias: 'Admin QUAVEMIND',
        email: 'admin@quavemind.com',
        rol: 'ADMIN',
      }
    });
    console.log(`✓ Admin creado (ID: ${admin.id})`);

    // Crear anotaciones de ejemplo
    console.log('\n💡 Creando anotaciones de ejemplo...');
    
    await prisma.anotacion.createMany({
      skipDuplicates: true,
      data: [
        {
          cancionId: '1IHWl5LamUGEuP4vKdpPSd',
          autorId: admin.id,
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
          autorId: admin.id,
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
          autorId: admin.id,
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
    });
    console.log(`✓ 3 anotaciones creadas`);

    // Mostrar resumen
    console.log('\n' + '='.repeat(50));
    console.log('✅ SEED COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log(`📊 RESUMEN:`);
    console.log(`   • Artistas: ${await prisma.artista.count()}`);
    console.log(`   • Álbumes: ${await prisma.album.count()}`);
    console.log(`   • Canciones: ${await prisma.cancion.count()}`);
    console.log(`   • Letras: ${await prisma.letra.count()}`);
    console.log(`   • Anotaciones: ${await prisma.anotacion.count()}`);
    console.log(`   • Usuarios: ${await prisma.usuario.count()}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Error en el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();