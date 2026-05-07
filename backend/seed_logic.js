import prisma from './db.js';
import bcrypt from 'bcrypt';

export async function execSeed() {
  console.log('🌱 Iniciando siembra de datos...');
  const logs = [];

  try {
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('quave123', salt);

    const usuariosBase = [
      {
        email: 'admin@quavemind.com',
        username: 'QuaveAdmin',
        passwordHash: commonPassword,
        bio: 'Arquitecto del sistema QuaveMind. Supervisando la escena urbana.',
        ubicacion: 'Madrid, Distrito Central',
        quavePoints: 5000,
        rol: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
      },
      {
        email: 'user@quavemind.com',
        username: 'UrbanExplorer',
        passwordHash: commonPassword,
        bio: 'Amante del trap y el reggaetón. Siempre buscando el próximo hit.',
        ubicacion: 'Barcelona, El Raval',
        quavePoints: 1200,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Urban'
      }
    ];

    const masUsuarios = [
      { username: 'TrapQueen_99', email: 'tq99@example.com', ubicacion: 'San Juan, PR', points: 2800, bio: 'Reggaetón old school y drill.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen' },
      { username: 'ElPadrino_Music', email: 'padrino@example.com', ubicacion: 'Medellín, COL', points: 3500, bio: 'Manager en la sombra. Quavemind es mi despacho.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Padrino' },
      { username: 'CyberFlow', email: 'flow@example.com', ubicacion: 'Miami, USA', points: 1500, bio: 'Viviendo en el 2077. Trap futurista.', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Flow' },
      { username: 'LaRosalia_Fan', email: 'motomami@example.com', ubicacion: 'Sevilla, ESP', points: 900, bio: 'A tope con el flamenco urbano.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rosy' },
      { username: 'Duki_Style', email: 'duki@example.com', ubicacion: 'Buenos Aires, ARG', points: 2100, bio: 'Desde el fin del mundo. Modo Diablo.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diablo' },
      { username: 'StreetVibes', email: 'street@example.com', ubicacion: 'Santiago, CHI', points: 600, bio: 'Grabando en la calle.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Street' },
      { username: 'NeoPerreo', email: 'neo@example.com', ubicacion: 'DF, MEX', points: 1750, bio: 'El perreo del futuro ya está aquí.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo' },
      { username: 'GoldChainz', email: 'gold@example.com', ubicacion: 'Caracas, VEN', points: 300, bio: 'Diamantes y beats pesados.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gold' },
      { username: 'DrillMaster_UK', email: 'drill@example.com', ubicacion: 'London, UK', points: 1250, bio: 'Bringing the UK sound to Quavemind.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Drill' },
      { username: 'VallenatoKing', email: 'vallenato@example.com', ubicacion: 'Valledupar, COL', points: 850, bio: 'El acordeón también es urbano.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=King' },
      { username: 'Anuel_RealG', email: 'anuel@example.com', ubicacion: 'Carolina, PR', points: 4000, bio: 'Real hasta la muerte oíste bebé.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RealG' },
      { username: 'BadGal_Riri', email: 'riri@example.com', ubicacion: 'Barbados', points: 2900, bio: 'Shine bright like a diamond.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riri' }
    ];

    const todosLosUsuarios = [
      ...usuariosBase,
      ...masUsuarios.map(u => ({
        email: u.email,
        username: u.username,
        passwordHash: commonPassword,
        bio: u.bio,
        ubicacion: u.ubicacion,
        quavePoints: u.points,
        avatar: u.avatar
      }))
    ];

    for (const u of todosLosUsuarios) {
      const user = await prisma.usuario.upsert({
        where: { email: u.email },
        update: u,
        create: u
      });
      logs.push(`Usuario creado/actualizado: ${user.username}`);

      // Favoritos
      const favs = [
        {
          tipo: 'artista',
          itemId: '4q3In0BDbbvwiC7fs9p6M7',
          snapshot: { nombre: 'Bad Bunny', imagen: 'https://i.scdn.co/image/ab6761610000e5eb9913d17d091e779f64835848' }
        },
        {
          tipo: 'cancion',
          itemId: '17999819999P9999999999',
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
    }

    return logs;
  } catch (error) {
    console.error('❌ Error en la siembra:', error);
    throw error;
  }
}
