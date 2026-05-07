import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const artists = await prisma.artista.findMany({
    take: 20,
    orderBy: { popularidad: 'desc' }
  });
  console.log(JSON.stringify(artists, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
