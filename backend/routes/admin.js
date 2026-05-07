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
        avatar: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'ok', usuarios });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al obtener usuarios' });
  }
});

// 2. Cambiar rol de un usuario
router.patch('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { nuevoRol } = req.body;

  if (!['USER', 'ADMIN'].includes(nuevoRol)) {
    return res.status(400).json({ status: 'error', mensaje: 'Rol no válido' });
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { rol: nuevoRol }
    });
    res.json({ status: 'ok', usuario });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al actualizar el rol' });
  }
});

// 3. Eliminar usuario (Banear)
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
