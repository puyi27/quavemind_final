import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PISTAS_ARTISTAS = [
  {
    tipo: 'artist',
    respuesta: 'Bad Bunny',
    respuestasAceptadas: ['bad bunny', 'benito', 'san benito'],
    pistaGenero: 'Trap Latino / Reggaetón',
    pistaAnio: '2016 (Debut con Hear This Music)',
    pistaAlbum: 'Un Verano Sin Ti',
    pistaColaboradores: ['Jhayco', 'Mora', 'Rauw Alejandro', 'Bizarrap'],
    pistaCanciones: ['Dakiti', 'Tití Me Preguntó', 'Soy Peor'],
    pistaAdjetivos: ['El Conejo Malo', 'Cara del género urbano mundial', 'Líder en streams']
  },
  {
    tipo: 'artist',
    respuesta: 'Quevedo',
    respuestasAceptadas: ['quevedo', 'pedro quevedo'],
    pistaGenero: 'Urbano / Dancehall',
    pistaAnio: '2020 (Debut)',
    pistaAlbum: 'DONDE QUIERO ESTAR',
    pistaColaboradores: ['Bizarrap', 'Saiko', 'Myke Towers', 'Mora'],
    pistaCanciones: ['Columbia', 'Punto G', 'Vista al Mar'],
    pistaAdjetivos: ['Orgullo Canario', 'Voz grave inconfundible', 'Récord en la Session 52']
  },
  {
    tipo: 'artist',
    respuesta: 'Rosalía',
    respuestasAceptadas: ['rosalia', 'la rosalia'],
    pistaGenero: 'Flamenco-Pop / Reggaetón / Experimental',
    pistaAnio: '2017 (Los Ángeles)',
    pistaAlbum: 'MOTOMAMI',
    pistaColaboradores: ['The Weeknd', 'Tokischa', 'Rauw Alejandro', 'J Balvin'],
    pistaCanciones: ['Saoko', 'Malamente', 'Despechá'],
    pistaAdjetivos: ['La Motomami', 'Innovadora del flamenco', 'Ganadora de múltiples Grammys']
  },
  {
    tipo: 'artist',
    respuesta: 'Duki',
    respuestasAceptadas: ['duki', 'el duko'],
    pistaGenero: 'Trap Argentino',
    pistaAnio: '2017 (She Don\'t Care)',
    pistaAlbum: 'Desde el Fin del Mundo',
    pistaColaboradores: ['Bizarrap', 'Khea', 'Ysy A', 'Emilia'],
    pistaCanciones: ['Goteo', 'Givenchy', 'Malbec'],
    pistaAdjetivos: ['Líder del trap argentino', 'Quinto Escalón', 'Voz del movimiento']
  },
  {
    tipo: 'artist',
    respuesta: 'Feid',
    respuestasAceptadas: ['feid', 'ferxxo'],
    pistaGenero: 'Reggaetón Paisa',
    pistaAnio: '2015 (Debut)',
    pistaAlbum: 'FELIZ CUMPLEAÑOS FERXXO',
    pistaColaboradores: ['Karol G', 'Young Miko', 'Mora', 'Ozuna'],
    pistaCanciones: ['Classy 101', 'Luna', 'Chorrito pa las animas'],
    pistaAdjetivos: ['El Ferxxo', 'Representante de Medellín', 'Color verde característico']
  }
];

async function seed() {
  console.log('Iniciando carga de pistas curadas...');
  for (const p of PISTAS_ARTISTAS) {
    await prisma.pistaQuavedle.upsert({
      where: { id: p.respuesta }, // Uso la respuesta como ID temporal para evitar duplicados en el seed
      update: p,
      create: {
        ...p,
        id: undefined // Dejar que Prisma genere el UUID
      }
    });
  }
  console.log('Carga completada: 5 artistas con pistas específicas añadidos.');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
