import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar .env explícitamente desde la raíz del backend
dotenv.config({ path: join(__dirname, '.env') })

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://quavemind_owner:uWv5IUNtqH7X@ep-autumn-salad-a2llucik-pooler.eu-central-1.aws.neon.tech/quavemind?sslmode=require"

console.log('🔌 Conectando a BD:', DATABASE_URL.substring(0, 50) + '...')

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL }
  },
  log: ['error', 'warn']
})

// Verificación de conexión inmediata
prisma.$connect()
  .then(() => console.log('✅ Conexión a Base de Datos exitosa.'))
  .catch((err) => {
    console.error('❌ ERROR CRÍTICO: No se pudo conectar a la Base de Datos.');
    console.error('Detalles:', err.message);
  });

export default prisma