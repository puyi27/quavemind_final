import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Crear una anotación
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      cancionId,
      inicio,
      fin,
      textoSeleccionado,
      titulo,
      contenido,
      artistaMencionadoId,
    } = req.body;
    
    const autorId = req.usuario.id;

    // Validaciones
    if (!cancionId || !contenido || inicio === undefined || fin === undefined) {
      return res.status(400).json({
        status: 'error',
        mensaje: 'Faltan campos requeridos: cancionId, inicio, fin, contenido',
      });
    }

    // Verificar que la canción existe
    const cancion = await prisma.cancion.findUnique({
      where: { id: cancionId },
      include: { letra: true },
    });

    if (!cancion) {
      return res.status(404).json({ status: 'error', mensaje: 'Canción no encontrada' });
    }

    // Si no hay letra, crear una vacía
    if (!cancion.letra) {
      await prisma.letra.create({
        data: {
          cancionId,
          texto: '',
          estado: 'INCOMPLETA',
        },
      });
    }

    // Crear la anotación
    const anotacion = await prisma.anotacion.create({
      data: {
        cancionId,
        autorId: autorId,
        inicio: parseInt(inicio),
        fin: parseInt(fin),
        textoSeleccionado: textoSeleccionado || '',
        titulo: titulo || null,
        contenido,
        artistaMencionadoId: artistaMencionadoId || null,
        estado: 'PENDIENTE',
      },
      include: {
        autor: {
          select: { id: true, alias: true, avatar: true, rol: true },
        },
        artistaMencionado: {
          select: { id: true, nombre: true, imagen: true },
        },
      },
    });

    res.status(201).json({
      status: 'ok',
      mensaje: 'Anotación creada y pendiente de aprobación',
      anotacion,
    });
  } catch (error) {
    console.error('Error creando anotación:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Obtener anotaciones de una canción
router.get('/cancion/:cancionId', async (req, res) => {
  try {
    const { cancionId } = req.params;
    const { estado = 'APROBADA', usuarioId } = req.query;

    const where = {
      cancionId,
    };

    if (estado !== 'TODOS') {
      where.estado = estado;
    }

    // Si hay usuarioId, mostrar también sus anotaciones pendientes
    if (usuarioId) {
      where.OR = [
        { estado: estado === 'TODOS' ? undefined : estado },
        { autorId: usuarioId, estado: 'PENDIENTE' },
      ];
    }

    const anotaciones = await prisma.anotacion.findMany({
      where,
      include: {
        autor: {
          select: { id: true, alias: true, avatar: true, rol: true },
        },
        artistaMencionado: {
          select: { id: true, nombre: true, imagen: true },
        },
      },
      orderBy: [
        { estado: 'asc' },
        { votosPositivos: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      status: 'ok',
      total: anotaciones.length,
      anotaciones,
    });
  } catch (error) {
    console.error('Error obteniendo anotaciones:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Obtener una anotación específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const anotacion = await prisma.anotacion.findUnique({
      where: { id },
      include: {
        cancion: {
          include: {
            album: true,
            artistas: {
              include: { artista: true },
            },
          },
        },
        autor: {
          select: { id: true, alias: true, avatar: true, rol: true },
        },
        artistaMencionado: {
          select: { id: true, nombre: true, imagen: true },
        },
      },
    });

    if (!anotacion) {
      return res.status(404).json({ status: 'error', mensaje: 'Anotación no encontrada' });
    }

    res.json({ status: 'ok', anotacion });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Actualizar una anotación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, autorId } = req.body;

    // Verificar que el usuario es el autor
    const anotacionExistente = await prisma.anotacion.findUnique({
      where: { id },
    });

    if (!anotacionExistente) {
      return res.status(404).json({ status: 'error', mensaje: 'Anotación no encontrada' });
    }

    if (anotacionExistente.autorId !== autorId) {
      return res.status(403).json({ status: 'error', mensaje: 'No tienes permiso para editar esta anotación' });
    }

    const anotacion = await prisma.anotacion.update({
      where: { id },
      data: {
        titulo: titulo !== undefined ? titulo : undefined,
        contenido: contenido !== undefined ? contenido : undefined,
        estado: 'PENDIENTE', // Vuelve a revisión si se edita
      },
      include: {
        autor: {
          select: { id: true, alias: true, avatar: true },
        },
      },
    });

    res.json({
      status: 'ok',
      mensaje: 'Anotación actualizada y pendiente de revisión',
      anotacion,
    });
  } catch (error) {
    console.error('Error actualizando anotación:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Eliminar una anotación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { autorId, esAdmin } = req.body;

    const anotacion = await prisma.anotacion.findUnique({
      where: { id },
    });

    if (!anotacion) {
      return res.status(404).json({ status: 'error', mensaje: 'Anotación no encontrada' });
    }

    // Solo el autor o admin pueden eliminar
    if (anotacion.autorId !== autorId && !esAdmin) {
      return res.status(403).json({ status: 'error', mensaje: 'No tienes permiso para eliminar esta anotación' });
    }

    await prisma.anotacion.delete({
      where: { id },
    });

    res.json({ status: 'ok', mensaje: 'Anotación eliminada' });
  } catch (error) {
    console.error('Error eliminando anotación:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Votar una anotación
router.post('/:id/votar', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body; // 'positivo' o 'negativo'

    if (!['positivo', 'negativo'].includes(tipo)) {
      return res.status(400).json({ status: 'error', mensaje: 'Tipo de voto inválido' });
    }

    const anotacion = await prisma.anotacion.update({
      where: { id },
      data: {
        votosPositivos: tipo === 'positivo' ? { increment: 1 } : undefined,
        votosNegativos: tipo === 'negativo' ? { increment: 1 } : undefined,
      },
    });

    res.json({
      status: 'ok',
      mensaje: `Voto ${tipo} registrado`,
      votos: {
        positivos: anotacion.votosPositivos,
        negativos: anotacion.votosNegativos,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Moderar anotación (aprobar/rechazar) - Solo admin/moderador
router.put('/:id/moderar', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, moderadorId } = req.body;

    if (!['APROBADA', 'RECHAZADA', 'DESTACADA'].includes(estado)) {
      return res.status(400).json({ status: 'error', mensaje: 'Estado inválido' });
    }

    // Verificar que el moderador tiene permisos
    const moderador = await prisma.usuario.findUnique({
      where: { id: moderadorId },
    });

    if (!moderador || !['ADMIN', 'MODERADOR'].includes(moderador.rol)) {
      return res.status(403).json({ status: 'error', mensaje: 'Sin permisos de moderación' });
    }

    const anotacion = await prisma.anotacion.update({
      where: { id },
      data: { estado },
      include: {
        autor: {
          select: { id: true, alias: true, avatar: true },
        },
        cancion: {
          select: { id: true, nombre: true },
        },
      },
    });

    res.json({
      status: 'ok',
      mensaje: `Anotación ${estado.toLowerCase()}`,
      anotacion,
    });
  } catch (error) {
    console.error('Error moderando anotación:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Obtener anotaciones pendientes de moderación
router.get('/moderacion/pendientes', async (req, res) => {
  try {
    const { moderadorId } = req.query;

    // Verificar permisos
    const moderador = await prisma.usuario.findUnique({
      where: { id: moderadorId },
    });

    if (!moderador || !['ADMIN', 'MODERADOR'].includes(moderador.rol)) {
      return res.status(403).json({ status: 'error', mensaje: 'Sin permisos de moderación' });
    }

    const anotaciones = await prisma.anotacion.findMany({
      where: { estado: 'PENDIENTE' },
      include: {
        cancion: {
          include: {
            album: true,
            artistas: {
              include: { artista: true },
            },
          },
        },
        autor: {
          select: { id: true, alias: true, avatar: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'ok',
      total: anotaciones.length,
      anotaciones,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Guardar letra de una canción
router.post('/letra', async (req, res) => {
  try {
    const { cancionId, texto, fuente = 'genius', urlFuente } = req.body;

    if (!cancionId || !texto) {
      return res.status(400).json({
        status: 'error',
        mensaje: 'Faltan cancionId o texto',
      });
    }

    const letra = await prisma.letra.upsert({
      where: { cancionId },
      update: {
        texto,
        fuente,
        urlFuente,
        estado: 'VERIFICADA',
      },
      create: {
        cancionId,
        texto,
        fuente,
        urlFuente,
        estado: 'PENDIENTE',
      },
    });

    res.json({
      status: 'ok',
      mensaje: 'Letra guardada',
      letra,
    });
  } catch (error) {
    console.error('Error guardando letra:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

export default router;