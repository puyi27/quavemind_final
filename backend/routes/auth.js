import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { password, username } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!email || !password || !username) {
      return res.status(400).json({
        status: 'error',
        mensaje: 'Faltan campos obligatorios (email, password, username).'
      });
    }

    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        status: 'error',
        mensaje: 'El Email o el Nombre de Usuario ya están registrados.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
      }
    });

    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email },
      process.env.JWT_SECRET || 'secreto_desarrollo_quavemind',
      { expiresIn: '7d' }
    );

    res.cookie('quave_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Ajustado a lax para compatibilidad local
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      status: 'ok',
      token, // Devolvemos el token para guardarlo en localStorage
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        username: nuevoUsuario.username,
        avatar: nuevoUsuario.avatar
      }
    });

  } catch (error) {
    console.error('CRITICAL ERROR during registration:', {
      message: error.message,
      stack: error.stack,
      code: error.code // Prisma error codes
    });
    res.status(500).json({
      status: 'error',
      mensaje: `Error interno del servidor: ${error.message || 'Error en el expediente'}`
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email?.toLowerCase().trim();

    console.log(`[AUTH] Intento de login para: ${email}`);

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      console.warn(`[AUTH] Usuario no encontrado: ${email}`);
      return res.status(401).json({
        status: 'error',
        mensaje: 'ACCESO DENEGADO: Credenciales corruptas o inexistentes.'
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      console.warn(`[AUTH] Contraseña incorrecta para: ${email}`);
      return res.status(401).json({
        status: 'error',
        mensaje: 'ACCESO DENEGADO: Clave de cifrado incorrecta.'
      });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'secreto_desarrollo_quavemind',
      { expiresIn: '7d' }
    );

    res.cookie('quave_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      status: 'ok',
      token, // Devolvemos el token para guardarlo en localStorage
      usuario: {
        id: usuario.id,
        email: usuario.email,
        username: usuario.username,
        avatar: usuario.avatar
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 'error',
      mensaje: 'Error interno del servidor durante la autenticación.'
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('quave_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    status: 'ok',
    mensaje: 'Desconexión exitosa del terminal.'
  });
});

router.get('/me', authenticate, async (req, res) => {
  res.status(200).json({ status: 'ok', usuario: req.usuario });
});

// Actualización de perfil (Soporta POST y PUT para flexibilidad)
const handleUpdateProfile = async (req, res) => {
  try {
    const { bio, avatar, ubicacion, newPassword } = req.body;
    const usuarioId = req.usuario.id;

    const dataToUpdate = {
      bio: bio !== undefined ? bio : undefined,
      avatar: avatar !== undefined ? avatar : undefined,
      ubicacion: ubicacion !== undefined ? ubicacion : undefined,
    };

    if (newPassword && newPassword.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        ubicacion: true,
        quavePoints: true
      }
    });

    res.json({ status: 'ok', usuario: usuarioActualizado });
  } catch (error) {
    console.error('Error en update-profile:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al actualizar el perfil.' });
  }
};

router.post('/update-profile', authenticate, handleUpdateProfile);
router.put('/update-profile', authenticate, handleUpdateProfile);

// Alias para compatibilidad con rutas antiguas y evitar 404s
router.put('/profile/:id', authenticate, handleUpdateProfile);
router.post('/upload-avatar', authenticate, (req, res) => {
  res.status(400).json({ 
    status: 'error', 
    mensaje: 'Por favor, usa el campo de avatar en update-profile con formato Base64 o URL.' 
  });
});

/**
 * Obtener perfil público de cualquier usuario.
 */
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el ID es válido
    if (!id || id === 'undefined' || id === 'null' || id.length < 10) {
      return res.json({ 
        status: 'ok', 
        usuario: {
          id: id || 'unknown',
          username: 'Usuario Anónimo',
          bio: null,
          avatar: null,
          ubicacion: null,
          quavePoints: 0,
          favoritos: [],
          valoraciones: []
        }
      });
    }

    // Consulta con relaciones a la Bóveda (Favoritos y Valoraciones)
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        ubicacion: true,
        quavePoints: true,
        createdAt: true,
        favoritos: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        },
        valoraciones: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!usuario) {
      // Devolver usuario placeholder en lugar de error 404
      return res.json({ 
        status: 'ok', 
        usuario: {
          id: id,
          username: 'Usuario no encontrado',
          bio: null,
          avatar: null,
          ubicacion: null,
          quavePoints: 0,
          favoritos: [],
          valoraciones: []
        }
      });
    }

    // Datos del usuario con sus relaciones
    const usuarioResponse = {
      ...usuario,
      quavePoints: usuario.quavePoints || 0,
      favoritos: usuario.favoritos || [],
      valoraciones: usuario.valoraciones || []
    };

    res.json({ status: 'ok', usuario: usuarioResponse });
  } catch (error) {
    console.error('Error en perfil público:', error.message);
    // Nunca devolver error 500, siempre devolver datos válidos
    res.json({ 
      status: 'ok', 
      usuario: {
        id: req.params.id || 'unknown',
        username: 'Usuario',
        bio: null,
        avatar: null,
        ubicacion: null,
        quavePoints: 0,
        favoritos: [],
        valoraciones: []
      }
    });
  }
});

/**
 * Buscar usuarios por username.
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ status: 'ok', usuarios: [] });

    const usuarios = await prisma.usuario.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        quavePoints: true
      },
      take: 10
    });

    res.json({ status: 'ok', usuarios });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error en la búsqueda de usuarios.' });
  }
});

/**
 * Obtener ranking global por Quave Points.
 */
router.get('/leaderboard', async (req, res) => {
  try {
    // Intentar ordenar por quavePoints, si falla usar createdAt como fallback
    let usuarios = [];
    try {
      usuarios = await prisma.usuario.findMany({
        orderBy: { quavePoints: 'desc' },
        select: {
          id: true,
          username: true,
          quavePoints: true,
          ubicacion: true
        },
        take: 30
      });
    } catch (e) {
      // Fallback si quavePoints no existe
      usuarios = await prisma.usuario.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          quavePoints: true,
          ubicacion: true
        },
        take: 30
      });
    }

    // Asegurar que cada usuario tenga quavePoints
    const usuariosConPuntos = usuarios.map(u => ({
      ...u,
      quavePoints: u.quavePoints || 0
    }));

    res.json({ status: 'ok', leaderboard: usuariosConPuntos });
  } catch (error) {
    console.error('Error en leaderboard:', error);
    // Devolver array vacío en lugar de error 500
    res.json({ status: 'ok', leaderboard: [] });
  }
});

export default router;