import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedPath = path.join(__dirname, '..', 'data', 'jerga.seed.json');

const normalizarTexto = (valor) => `${valor || ''}`.trim();

const cargarEntradas = async () => {
  const contenido = await fs.readFile(seedPath, 'utf8');
  const data = JSON.parse(contenido);

  if (!Array.isArray(data)) {
    throw new Error('El archivo de seed de jerga no contiene un array valido');
  }

  return data
    .map((entrada) => ({
      termino: normalizarTexto(entrada.termino),
      significado: normalizarTexto(entrada.significado),
      contexto: normalizarTexto(entrada.contexto) || null,
      origen: normalizarTexto(entrada.origen) || null,
    }))
    .filter((entrada) => entrada.termino && entrada.significado);
};

const main = async () => {
  const entradas = await cargarEntradas();
  let procesadas = 0;

  for (const entrada of entradas) {
    await prisma.jerga.upsert({
      where: { termino: entrada.termino },
      update: {
        significado: entrada.significado,
        contexto: entrada.contexto,
        origen: entrada.origen,
      },
      create: entrada,
    });

    procesadas += 1;
  }

  console.log(`Jerga sincronizada: ${procesadas} termino(s) procesados.`);
};

main()
  .catch((error) => {
    console.error('Error al sembrar la jerga:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
