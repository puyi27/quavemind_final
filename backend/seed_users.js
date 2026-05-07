import prisma from './db.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Iniciando siembra de datos...');

  try {
    // 1. Limpiar datos previos (Opcional, pero recomendado para un seed limpio)
    // await prisma.favorito.deleteMany();
    // await prisma.valoracion.deleteMany();
    // await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('quave123', salt);

    // 2. Crear Usuarios
    const usuarios = [
      {
        email: 'admin@quavemind.com',
        username: 'QuaveAdmin',
        passwordHash: commonPassword,
        bio: 'Arquitecto del sistema QuaveMind. Supervisando la escena urbana.',
        ubicacion: 'Madrid, Distrito Central',
        quavePoints: 5000,
        rol: 'ADMIN'
      },
      {
        email: 'user@quavemind.com',
        username: 'UrbanExplorer',
        passwordHash: commonPassword,
        bio: 'Amante del trap y el reggaetón. Siempre buscando el próximo hit.',
        ubicacion: 'Barcelona, El Raval',
        quavePoints: 1200
      },
      {
        email: 'tester@quavemind.com',
        username: 'BetaTester',
        passwordHash: commonPassword,
        bio: 'Probando la estabilidad del búnker musical.',
        ubicacion: 'Medellín, Poblado',
        quavePoints: 450
      }
    ];

    for (const u of usuarios) {
      const user = await prisma.usuario.upsert({
        where: { email: u.email },
        update: u,
        create: u
      });
      console.log(`✅ Usuario creado/actualizado: ${user.username}`);

      // 3. Añadir Favoritos de ejemplo
      const favs = [
        {
          tipo: 'artista',
          itemId: '4q3In0BDbbvwiC7fs9p6M7', // Bad Bunny
          snapshot: { nombre: 'Bad Bunny', imagen: 'https://i.scdn.co/image/ab6761610000e5eb9913d17d091e779f64835848' }
        },
        {
          tipo: 'cancion',
          itemId: '2993YvU699P17Y0P9919P9',
          snapshot: { nombre: 'MONACO', artista: 'Bad Bunny', imagen: 'https://i.scdn.co/image/ab67616d0000b27349d6942032e9977e150387ad' }
        }
      ];

      for (const f of favs) {
        await prisma.favorito.upsert({
          where: {
            usuarioId_tipo_itemId: {
              usuarioId: user.id,
              tipo: f.tipo,
              itemId: f.itemId
            }
          },
          update: { snapshot: f.snapshot },
          create: {
            usuarioId: user.id,
            tipo: f.tipo,
            itemId: f.itemId,
            snapshot: f.snapshot
          }
        });
      }

      // 4. Añadir Valoraciones de ejemplo
      const vals = [
        {
          tipo: 'cancion',
          itemId: '2993YvU699P17Y0P9919P9',
          rating: 4.5,
          comentario: 'Un beat increíble, el sample de Charles Aznavour es magistral.',
          snapshot: { nombre: 'MONACO', artista: 'Bad Bunny', imagen: 'https://i.scdn.co/image/ab67616d0000b27349d6942032e9977e150387ad' }
        }
      ];

      for (const v of vals) {
        await prisma.valoracion.upsert({
          where: {
            usuarioId_tipo_itemId: {
              usuarioId: user.id,
              tipo: v.tipo,
              itemId: v.itemId
            }
          },
          update: { rating: v.rating, comentario: v.comentario, snapshot: v.snapshot },
          create: {
            usuarioId: user.id,
            tipo: v.tipo,
            itemId: v.itemId,
            rating: v.rating,
            comentario: v.comentario,
            snapshot: v.snapshot
          }
        });
      }
    }

    console.log('🚀 Siembra de datos completada con éxito.');
  } catch (error) {
    console.error('❌ Error en la siembra:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
