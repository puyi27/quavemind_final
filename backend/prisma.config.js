import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar .env explícitamente
dotenv.config({ path: join(__dirname, '.env') })

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}