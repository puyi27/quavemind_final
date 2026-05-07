import prisma from './db.js';

async function test() {
  try {
    const users = await prisma.usuario.findMany({ take: 1 });
    console.log('SUCCESS: Connection to DB working. Found', users.length, 'users.');
  } catch (err) {
    console.error('FAILURE: Connection to DB failed.');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
