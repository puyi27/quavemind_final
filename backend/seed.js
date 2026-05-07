import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const gustos = ['el Trap', 'el Drill', 'el R&B', 'el Reggaeton', 'el Pop Urbano', 'la electrónica', 'el Rap clásico', 'el Hip-Hop', 'el Dembow', 'el Neoperreo', 'el Afrobeat'];
const ubicaciones = ['Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Málaga', 'Zaragoza', 'Bilbao', 'Granada', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'A Coruña', 'Vitoria', 'Oviedo', 'Santander', 'Pamplona', 'Almería', 'San Sebastián', 'Burgos', 'Salamanca', 'Albacete', 'Cádiz', 'Logroño', 'Badajoz', 'Huelva', 'León', 'Tarragona', 'Cáceres'];

const artistasMock = [
  { id: '4q3ewBC67STu3gU6ZpLsGv', nombre: 'Bad Bunny', imagen: 'https://i.scdn.co/image/ab6761610000e5eb9bb6b51031a5477dc8161741' },
  { id: '7ltDVBrZoMvPeq3KMVqT7s', nombre: 'Rosalía', imagen: 'https://i.scdn.co/image/ab6761610000e5eb986348c4149028a362cf1639' },
  { id: '26dkYmSqc0cyS7ZGEJv527', nombre: 'C. Tangana', imagen: 'https://i.scdn.co/image/ab6761610000e5eb38ba5148003f56e077a7df64' },
  { id: '1vyhD5VuzS61rbsN9C36fg', nombre: 'Feid', imagen: 'https://i.scdn.co/image/ab6761610000e5eb6903ee402b8504445353e144' },
  { id: '4796639c06ed17ed84770d', nombre: 'Young Miko', imagen: 'https://i.scdn.co/image/ab6761610000e5eb60443fb7492cb7035ce46473' },
  { id: '6v6968037d800000000000', nombre: 'Rauw Alejandro', imagen: 'https://i.scdn.co/image/ab6761610000e5ebc5ec090de6204c4149eeb7b3' }
];

const cancionesMock = [
  { id: '2p8uS9uS9uS9uS9uS9uS9u', nombre: 'MONACO', artista: 'Bad Bunny', imagen: 'https://i.scdn.co/image/ab67616d0000b2734994e6378e176b9bc10b8045' },
  { id: '3q8uS9uS9uS9uS9uS9uS9u', nombre: 'Columbia', artista: 'Quevedo', imagen: 'https://i.scdn.co/image/ab67616d0000b27392553733076899432f41656c' },
  { id: '4r8uS9uS9uS9uS9uS9uS9u', nombre: 'DESPECHÁ', artista: 'Rosalía', imagen: 'https://i.scdn.co/image/ab67616d0000b273570624d67319c5c9603e8785' },
  { id: '5s8uS9uS9uS9uS9uS9uS9u', nombre: 'Demasiadas Mujeres', artista: 'C. Tangana', imagen: 'https://i.scdn.co/image/ab67616d0000b27338ba5148003f56e077a7df64' },
  { id: '6t8uS9uS9uS9uS9uS9uS9u', nombre: 'LALA', artista: 'Myke Towers', imagen: 'https://i.scdn.co/image/ab67616d0000b2739306b998e16d4705597d620c' }
];

const albumesMock = [
  { id: '4G8uS9uS9uS9uS9uS9uS9u', nombre: 'nadie sabe lo que va a pasar mañana', artista: 'Bad Bunny', imagen: 'https://i.scdn.co/image/ab67616d0000b2734994e6378e176b9bc10b8045' },
  { id: '5H8uS9uS9uS9uS9uS9uS9u', nombre: 'EL MADRILEÑO', artista: 'C. Tangana', imagen: 'https://i.scdn.co/image/ab67616d0000b27338ba5148003f56e077a7df64' },
  { id: '6J8uS9uS9uS9uS9uS9uS9u', nombre: 'MOTOMAMI', artista: 'Rosalía', imagen: 'https://i.scdn.co/image/ab67616d0000b273570624d67319c5c9603e8785' },
  { id: '7K8uS9uS9uS9uS9uS9uS9u', nombre: 'Donde quiero estar', artista: 'Quevedo', imagen: 'https://i.scdn.co/image/ab67616d0000b27392553733076899432f41656c' }
];

const comentariosAnalisis = [
  "Una pieza fundamental de la escena urbana actual. El diseño sonoro y la producción rompen los esquemas tradicionales. Análisis técnico: 10/10.",
  "Este proyecto redefine lo que significa ser un artista independiente hoy en día. Las texturas vocales y el ritmo demuestran una madurez increíble.",
  "Impacto cultural masivo. No es solo música, es un movimiento. La lírica es cruda pero necesaria para entender el contexto actual.",
  "Innovación pura. Cada track aporta algo nuevo al género. El uso de sintetizadores y la mezcla final son simplemente perfectos.",
  "Un viaje sonoro que merece ser escuchado en bucle. La narrativa es coherente y emocionante de principio a fin.",
  "Obra maestra del under. Representa fielmente los valores de Quavemind: autenticidad, riesgo y talento puro sin filtros."
];

function getRandomItems(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

async function main() {
  console.log('--- INICIANDO PURGA Y POBLACIÓN TÁCTICA DE DATOS ---');

  // Limpiar tablas para evitar duplicados
  await prisma.favorito.deleteMany();
  await prisma.valoracion.deleteMany();
  await prisma.usuario.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash('password123', salt);

  for (let i = 1; i <= 37; i++) {
    const username = i === 1 ? 'Angel' : `Agente_${i}`;
    const email = i === 1 ? 'angel@quave.com' : `agente${i}@quavemind.net`;
    const xp = Math.floor(Math.random() * 5000);
    const gusto = gustos[Math.floor(Math.random() * gustos.length)];
    const ubicacion = ubicaciones[Math.floor(Math.random() * ubicaciones.length)];

    const user = await prisma.usuario.create({
      data: {
        username,
        email,
        passwordHash: hashedPass,
        quavePoints: xp,
        ubicacion: ubicacion,
        bio: `Especialista en ${gusto} operando desde el sector ${ubicacion}. Archivo analítico encriptado.`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`
      }
    });

    console.log(`[+] Agente ${user.username} desplegado.`);

    // 1. Generar Favoritos de Artistas
    const favArtistas = getRandomItems(artistasMock, 3);
    for (const art of favArtistas) {
      await prisma.favorito.create({
        data: {
          usuarioId: user.id,
          tipo: 'artista',
          itemId: art.id,
          snapshot: { nombre: art.nombre, imagen: art.imagen }
        }
      });
    }

    // 2. Generar Favoritos de Canciones
    const favCanciones = getRandomItems(cancionesMock, 3);
    for (const can of favCanciones) {
      await prisma.favorito.create({
        data: {
          usuarioId: user.id,
          tipo: 'cancion',
          itemId: can.id,
          snapshot: { nombre: can.nombre, artista: can.artista, imagen: can.imagen }
        }
      });
    }

    // 3. Generar Favoritos de Álbumes
    const favAlbumes = getRandomItems(albumesMock, 2);
    for (const alb of favAlbumes) {
      await prisma.favorito.create({
        data: {
          usuarioId: user.id,
          tipo: 'album',
          itemId: alb.id,
          snapshot: { nombre: alb.nombre, artista: alb.artista, imagen: alb.imagen }
        }
      });
    }

    // 4. Generar Valoraciones (Auditorías)
    const numVals = Math.floor(Math.random() * 5) + 2;
    const targets = [...getRandomItems(cancionesMock, 3), ...getRandomItems(albumesMock, 2)];
    
    for (const target of targets) {
      const tipo = target.artista ? (target.id.includes('G') || target.id.includes('H') || target.id.includes('J') || target.id.includes('K') ? 'album' : 'cancion') : 'cancion';
      
      await prisma.valoracion.create({
        data: {
          usuarioId: user.id,
          tipo: target.artista && (target.id.startsWith('4G') || target.id.startsWith('5H') || target.id.startsWith('6J') || target.id.startsWith('7K')) ? 'album' : 'cancion',
          itemId: target.id,
          rating: Math.floor(Math.random() * 5) + 5, // 5-10
          comentario: comentariosAnalisis[Math.floor(Math.random() * comentariosAnalisis.length)],
          snapshot: { 
            nombre: target.nombre, 
            artista: target.artista, 
            imagen: target.imagen 
          }
        }
      });
    }
  }

  console.log('--- POBLACIÓN COMPLETADA CON ÉXITO ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
