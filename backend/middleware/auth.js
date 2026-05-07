import jwt from 'jsonwebtoken';
import prisma from '../db.js';

/**
 * Middleware para autenticar usuarios mediante el token JWT en la cookie.
 * Adjunta el objeto usuario a req.usuario si el token es válido.
 */
export const authenticate = async (req, res, next) => {
  // 1. Extraer token (Prioridad: Header Bearer > Cookie)
  let token = null;
  
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token && req.cookies?.quave_token) {
    token = req.cookies.quave_token;
  }

  // 2. Si no hay token, no es error de sistema, es simplemente "No autorizado"
  if (!token) {
    return res.status(401).json({
      status: 'error',
      mensaje: 'SESIÓN REQUERIDA: Debes iniciar sesión para realizar esta acción.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secreto_desarrollo_quavemind';
    const decoded = jwt.verify(token, secret);
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        username: true, 
        quavePoints: true,
        rol: true,
        avatar: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        mensaje: 'SESIÓN INVÁLIDA: El usuario ya no existe. Por favor, cierra sesión y vuelve a entrar.'
      });
    }

    // Adjuntamos el usuario a la request para usarlo en las rutas
    req.usuario = usuario;
    next();
  } catch (error) {
    // Si el error viene de jsonwebtoken, es un 401 real
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        mensaje: 'ERROR DE SEGURIDAD: El token de acceso es inválido o ha expirado.'
      });
    }
    
    // Si es un error de Prisma/Neon (timeout, límite de conexiones, etc.) devolvemos 500
    console.error('[AUTH MIDDLEWARE] Error de base de datos/Prisma:', error);
    return res.status(500).json({
      status: 'error',
      mensaje: 'ERROR DEL SERVIDOR: Fallo de conexión temporal con la base de datos.'
    });
  }
};
