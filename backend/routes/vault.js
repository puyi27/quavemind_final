import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { añadirQuavePoints } from '../lib/userStats.js';

const router = express.Router();

// --- VALORACIONES ---

// Obtener valoraciones del usuario logueado
router.get('/valoraciones', authenticate, async (req, res) => {
  try {
    const valoraciones = await prisma.valoracion.findMany({
      where: { usuarioId: req.usuario.id },
      select: {
        id: true,
        itemId: true,
        tipo: true,
        rating: true,
        snapshot: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ status: 'ok', valoraciones });
  } catch (error) {
    console.error('Error en GET /valoraciones:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error interno al obtener valoraciones' });
  }
});

// Guardar o actualizar una valoración
router.post('/valoraciones', authenticate, async (req, res) => {
  try {
    const { itemId, tipo, rating, snapshot, comentario } = req.body;
    const usuarioId = req.usuario.id;
    
    if (!itemId || !tipo || !rating) {
      return res.status(400).json({ status: 'error', mensaje: 'Faltan campos' });
    }

    // Comprobamos si ya existía para decidir si damos puntos
    const existente = await prisma.valoracion.findUnique({
      where: {
        usuarioId_tipo_itemId: {
          usuarioId,
          tipo,
          itemId
        }
      }
    });

    const valoracion = await prisma.valoracion.upsert({
      where: {
        usuarioId_tipo_itemId: {
          usuarioId,
          tipo,
          itemId
        }
      },
      update: {
        rating: parseFloat(rating),
        comentario: comentario || null,
        snapshot: snapshot || {}
      },
      create: {
        usuarioId,
        tipo,
        itemId,
        rating: parseFloat(rating),
        comentario: comentario || null,
        snapshot: snapshot || {}
      }
    });

      // Si es una valoración nueva (no un update), damos puntos
      let puntosGanados = 0;
      let totalPuntos = null;

      if (!existente) {
        const usuarioActualizado = await añadirQuavePoints(usuarioId, 10, 'valoracion_post');
        puntosGanados = 10;
        totalPuntos = usuarioActualizado.quavePoints;
      }

      res.json({ 
        status: 'ok', 
        valoracion, 
        puntosGanados,
        totalPuntos,
        mensaje: puntosGanados > 0 ? `¡Has ganado ${puntosGanados} Quave Points por tu valoración!` : 'Valoración actualizada.'
      });
    } catch (error) {
      console.error('Error en POST /valoraciones:', error);
      res.status(500).json({ status: 'error', mensaje: 'Error al guardar valoración' });
    }
  });
  
  // Obtener favoritos del usuario logueado
  router.get('/favoritos', authenticate, async (req, res) => {
    try {
      const favoritos = await prisma.favorito.findMany({
        where: { usuarioId: req.usuario.id },
        select: {
          id: true,
          itemId: true,
          tipo: true,
          snapshot: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ status: 'ok', favoritos });
    } catch (error) {
      console.error('Error en GET /favoritos:', error);
      res.status(500).json({ status: 'error', mensaje: 'Error al obtener favoritos' });
    }
  });

  // ... (Favoritos toggle)
  router.post('/favoritos/toggle', authenticate, async (req, res) => {
    try {
      const { itemId, tipo, snapshot } = req.body;
      const usuarioId = req.usuario.id;
  
      const existente = await prisma.favorito.findUnique({
        where: {
          usuarioId_tipo_itemId: {
            usuarioId,
            tipo,
            itemId
          }
        }
      });
  
      if (existente) {
        await prisma.favorito.delete({
          where: { id: existente.id }
        });
        return res.json({ status: 'ok', accion: 'quitado' });
      } else {
        // CREAR EL REGISTRO (Faltaba esta parte crítica)
        await prisma.favorito.create({
          data: {
            usuarioId,
            tipo,
            itemId,
            snapshot: snapshot || {}
          }
        });

        const usuarioActualizado = await añadirQuavePoints(usuarioId, 2, 'favorito_toggle');
        
        return res.json({ 
          status: 'ok', 
          accion: 'añadido', 
          totalPuntos: usuarioActualizado.quavePoints,
          mensaje: '¡2 Quave Points añadidos!'
        });
      }
    } catch (error) {
      console.error('Error en POST /favoritos/toggle:', error);
      res.status(500).json({ status: 'error', mensaje: 'Error al procesar favorito' });
    }
  });

  // Obtener todas las valoraciones de un item específico (opiniones globales)
  router.get('/opiniones/:tipo/:itemId', async (req, res) => {
    try {
      const { tipo, itemId } = req.params;
      const opiniones = await prisma.valoracion.findMany({
        where: { tipo, itemId },
        include: {
          usuario: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
      });
      res.json({ status: 'ok', opiniones });
    } catch (error) {
      console.error('Error en GET /opiniones:', error);
      res.status(500).json({ status: 'error', mensaje: 'Error al obtener opiniones' });
    }
  });

export default router;
