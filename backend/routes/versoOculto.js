import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// Obtener verso del día
router.get('/daily', async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar si ya hay un verso asignado para hoy
    const versoHoy = await prisma.pistaVersoOculto.findFirst({
      where: {
        usadaEnDiario: {
          gte: hoy,
        },
      },
      include: {
        cancion: {
          include: {
            artistas: {
              include: {
                artista: true,
              },
            },
            album: true,
          },
        },
      },
    });

    if (versoHoy) {
      const { cancion, ...versoSinRespuesta } = versoHoy;
      return res.json({
        status: 'ok',
        modo: 'daily',
        verso: {
          ...versoSinRespuesta,
          artistaNombre: null, // Ocultar
          cancionNombre: null, // Ocultar
        },
      });
    }

    // Si no hay, seleccionar uno nuevo
    const versosDisponibles = await prisma.pistaVersoOculto.findMany({
      where: {
        OR: [
          { usadaEnDiario: null },
          { usadaEnDiario: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        ],
      },
      include: {
        cancion: {
          include: {
            artistas: {
              include: {
                artista: true,
              },
            },
            album: true,
          },
        },
      },
    });

    if (versosDisponibles.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'No hay versos disponibles',
      });
    }

    // Seleccionar aleatoriamente
    const versoSeleccionado = versosDisponibles[Math.floor(Math.random() * versosDisponibles.length)];

    // Marcar como usado hoy
    await prisma.pistaVersoOculto.update({
      where: { id: versoSeleccionado.id },
      data: { usadaEnDiario: new Date() },
    });

    const { cancion, ...versoSinRespuesta } = versoSeleccionado;

    res.json({
      status: 'ok',
      modo: 'daily',
      verso: {
        ...versoSinRespuesta,
        artistaNombre: null,
        cancionNombre: null,
      },
    });
  } catch (error) {
    console.error('Error en /daily:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Obtener verso aleatorio
router.get('/random', async (req, res) => {
  try {
    const dificultad = req.query.dificultad ? parseInt(req.query.dificultad) : undefined;

    const where = {};
    if (dificultad) {
      where.dificultad = dificultad;
    }

    const versos = await prisma.pistaVersoOculto.findMany({
      where,
      include: {
        cancion: {
          include: {
            artistas: {
              include: {
                artista: true,
              },
            },
            album: true,
          },
        },
      },
    });

    if (versos.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'No hay versos disponibles',
      });
    }

    const verso = versos[Math.floor(Math.random() * versos.length)];
    const { cancion, ...versoSinRespuesta } = verso;

    res.json({
      status: 'ok',
      modo: 'random',
      verso: {
        ...versoSinRespuesta,
        artistaNombre: null,
        cancionNombre: null,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Verificar respuesta
router.post('/check', async (req, res) => {
  try {
    const { versoId, respuestaCancion, respuestaArtista, pistasUsadas = [] } = req.body;

    if (!versoId) {
      return res.status(400).json({
        status: 'error',
        mensaje: 'Falta versoId',
      });
    }

    const verso = await prisma.pistaVersoOculto.findUnique({
      where: { id: versoId },
      include: {
        cancion: {
          include: {
            artistas: {
              include: {
                artista: true,
              },
            },
          },
        },
      },
    });

    if (!verso) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'Verso no encontrado',
      });
    }

    const cancion = verso.cancion;
    const artistaPrincipal = cancion.artistas.find(a => a.esPrincipal)?.artista;
    const todosArtistas = cancion.artistas.map(a => a.artista.nombre.toLowerCase());

    // Verificar respuesta
    const respuestaNormalizada = respuestaCancion?.toLowerCase().trim();
    const cancionCorrecta = cancion.nombre.toLowerCase();
    const artistaNormalizado = respuestaArtista?.toLowerCase().trim();

    const aciertaCancion = respuestaNormalizada === cancionCorrecta ||
                          cancionCorrecta.includes(respuestaNormalizada) ||
                          respuestaNormalizada?.includes(cancionCorrecta);

    const aciertaArtista = artistaNormalizado && 
                          (todosArtistas.some(a => a === artistaNormalizado) ||
                           todosArtistas.some(a => a.includes(artistaNormalizado)));

    // Calcular puntos
    let puntos = 0;
    if (aciertaCancion) puntos += 100;
    if (aciertaArtista) puntos += 50;
    
    // Restar por pistas usadas
    const costoPistas = pistasUsadas.length * 20;
    puntos = Math.max(0, puntos - costoPistas);

    // Actualizar estadísticas
    await prisma.pistaVersoOculto.update({
      where: { id: versoId },
      data: {
        vecesJugada: { increment: 1 },
        aciertos: (aciertaCancion && aciertaArtista) ? { increment: 1 } : undefined,
      },
    });

    res.json({
      status: 'ok',
      correcto: {
        cancion: aciertaCancion,
        artista: aciertaArtista,
      },
      respuestaCorrecta: {
        cancion: cancion.nombre,
        artista: artistaPrincipal?.nombre || cancion.artistas[0]?.artista.nombre,
      },
      puntos,
      pistasDesbloqueadas: {
        artista: verso.pistaArtista,
        anio: verso.pistaAnio,
        album: verso.pistaAlbum,
      },
    });
  } catch (error) {
    console.error('Error en /check:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Obtener pista extra (cuesta puntos)
router.post('/:id/pista', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body; // 'artista', 'anio', 'album'

    const verso = await prisma.pistaVersoOculto.findUnique({
      where: { id },
      include: {
        cancion: {
          include: {
            album: true,
            artistas: {
              include: {
                artista: true,
              },
            },
          },
        },
      },
    });

    if (!verso) {
      return res.status(404).json({ status: 'error', mensaje: 'Verso no encontrado' });
    }

    let pista = null;
    switch (tipo) {
      case 'artista':
        pista = verso.pistaArtista || `Artista: ${verso.cancion.artistas[0]?.artista.nombre}`;
        break;
      case 'anio':
        pista = verso.pistaAnio || verso.cancion.album?.fecha?.substring(0, 4);
        break;
      case 'album':
        pista = verso.pistaAlbum || verso.cancion.album?.nombre;
        break;
      default:
        return res.status(400).json({ status: 'error', mensaje: 'Tipo de pista inválido' });
    }

    res.json({
      status: 'ok',
      tipo,
      pista,
      costo: 20,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Crear nuevo verso (admin)
router.post('/', async (req, res) => {
  try {
    const {
      cancionId,
      verso,
      inicioVerso,
      finVerso,
      pistaArtista,
      pistaAnio,
      pistaAlbum,
      dificultad,
    } = req.body;

    const nuevoVerso = await prisma.pistaVersoOculto.create({
      data: {
        cancionId,
        verso,
        inicioVerso,
        finVerso,
        pistaArtista,
        pistaAnio,
        pistaAlbum,
        dificultad: dificultad || 3,
      },
    });

    res.status(201).json({
      status: 'ok',
      verso: nuevoVerso,
    });
  } catch (error) {
    console.error('Error creando verso:', error);
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

export default router;