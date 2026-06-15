import prisma from '../db.js';

async function resetVersoDiario() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const versoHoy = await prisma.pistaVersoOculto.findFirst({
    where: {
      usadaEnDiario: {
        gte: hoy,
      },
    },
  });

  if (versoHoy) {
    await prisma.pistaVersoOculto.update({
      where: { id: versoHoy.id },
      data: { usadaEnDiario: null },
    });
    console.log(`Se ha hecho reset del Verso Oculto del día (id: ${versoHoy.id}).`);
  } else {
    console.log('No había un Verso Oculto asignado para hoy.');
  }

  await prisma.$disconnect();
}

resetVersoDiario().catch(console.error);
