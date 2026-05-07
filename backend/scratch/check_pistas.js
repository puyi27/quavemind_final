import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.pistaQuavedle.count();
  console.log('Total pistas:', count);
  const pistas = await prisma.pistaQuavedle.findMany({ take: 5 });
  console.log('Ejemplos:', JSON.stringify(pistas, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
