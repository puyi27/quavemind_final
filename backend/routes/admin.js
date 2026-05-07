import express from 'express';
import prisma from '../db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Aplicar seguridad a TODAS las rutas de este archivo
router.use(authenticate, authorizeAdmin);

// 1. Obtener todos los usuarios (Dashboard de Admin)
router.get('/users', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        quavePoints: true,
        createdAt: true,
        avatar: true,
        bio: true,
        ubicacion: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'ok', usuarios });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al obtener usuarios' });
  }
});

// 2. Crear un nuevo usuario manualmente
router.post('/users', async (req, res) => {
  const { username, email, password, rol, quavePoints } = req.body;
  try {
    const passwordHash = await import('bcrypt').then(b => b.default.hash(password, 10));
    const usuario = await prisma.usuario.create({
      data: {
        username,
        email,
        passwordHash,
        rol: rol || 'USER',
        quavePoints: parseInt(quavePoints) || 0
      }
    });
    res.json({ status: 'ok', usuario });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al crear usuario. El nombre o email ya podrían existir.' });
  }
});

// 3. Actualización completa de un usuario
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, rol, quavePoints, bio, ubicacion, password } = req.body;

  try {
    const data = { username, email, rol, quavePoints: parseInt(quavePoints), bio, ubicacion };
    
    // Si se envía contraseña, la hasheamos
    if (password && password.trim() !== '') {
      data.passwordHash = await import('bcrypt').then(b => b.default.hash(password, 10));
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data
    });
    res.json({ status: 'ok', usuario });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al actualizar el usuario' });
  }
});

// 4. Eliminar usuario (Banear)
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  if (id === req.usuario.id) {
    return res.status(400).json({ status: 'error', mensaje: 'No puedes borrarte a ti mismo' });
  }

  try {
    await prisma.usuario.delete({ where: { id } });
    res.json({ status: 'ok', mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al eliminar el usuario' });
  }
});

export default router;
