import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CONFIGURA AQUÍ TUS DATOS DEL NUEVO ADMIN
const USERNAME = 'quaveadmin'; // Pon el nombre que quieras
const EMAIL = 'admin@quavemind.com'; // Pon tu email
const PASSWORD = 'admin_quave_2024'; // ¡Cambia esto después!

async function main() {
  console.log('🚀 Iniciando creación de Superadmin...');
  
  try {
    // Comprobar si ya existe
    const existe = await prisma.usuario.findFirst({
      where: {
        OR: [{ username: USERNAME }, { email: EMAIL }]
      }
    });

    if (existe) {
      console.error('❌ ERROR: Ya existe un usuario con ese nombre o email.');
      process.exit(1);
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // Crear usuario
    const admin = await prisma.usuario.create({
      data: {
        username: USERNAME,
        email: EMAIL,
        passwordHash,
        rol: 'ADMIN',
        quavePoints: 9999, // Un toque de bonus para el admin
        bio: 'Terminal Admin Central de QUAVEMIND.'
      }
    });

    console.log('✅ SUPERADMIN CREADO CON ÉXITO');
    console.log('------------------------------');
    console.log(`Usuario: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Rol: ${admin.rol}`);
    console.log('------------------------------');
    console.log('Ya puedes iniciar sesión en la web.');

  } catch (error) {
    console.error('❌ FALLO CRÍTICO:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
