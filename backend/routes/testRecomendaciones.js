import { Router } from 'express';

const router = Router();

// Cache simple en memoria
const cache = {
  fecha: null,
  datos: null
};

// GET /api/test/recomendaciones - Endpoint de prueba simple
router.get('/recomendaciones', (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  
  // Si tenemos cache de hoy, devolverla
  if (cache.fecha === hoy && cache.datos) {
    return res.json({
      status: 'ok',
      desdeCache: true,
      fecha: hoy,
      mensaje: 'Datos desde cache (mismo día)',
      selecciones: cache.datos
    });
  }
  
  // Generar nuevos datos
  const seed = hoy.replace(/-/g, '');
  const artistas = ['Bad Bunny', 'Karol G', 'Feid', 'Anuel AA', 'Ozuna', 'Maluma'];
  const canciones = ['Un Verano Sin Ti', 'Mañana Será Bonito', 'Feliz Cumpleaños Ferxxo', 'Las Leyendas Nunca Mueren'];
  const albums = ['YHLQMDLG', 'KG0516', 'Inter Shibuya', 'LLNM'];
  
  // Seleccionar con seed
  const selecciones = {
    artistaDestacado: {
      id: `artist_${seed}`,
      nombre: artistas[seed % artistas.length],
      imagen: 'https://i.scdn.co/image/ab6761610000e5eb1234567890',
      popularidad: 85,
      tipo: 'Artista del Día'
    },
    cancionDelDia: {
      id: `track_${seed}`,
      nombre: canciones[seed % canciones.length],
      artista: 'Artista de Prueba',
      imagen: 'https://i.scdn.co/image/ab67616d0000b2731234567890',
      tipo: 'Canción del Día'
    },
    albumDelDia: {
      id: `album_${seed}`,
      nombre: albums[seed % albums.length],
      artista: 'Artista de Prueba',
      imagen: 'https://i.scdn.co/image/ab67616d0000b2730987654321',
      totalTracks: 12,
      tipo: 'Álbum del Día'
    }
  };
  
  // Guardar en cache
  cache.fecha = hoy;
  cache.datos = selecciones;
  
  res.json({
    status: 'ok',
    desdeCache: false,
    fecha: hoy,
    mensaje: 'Nuevos datos generados',
    selecciones
  });
});

// GET /api/test/limpiar - Limpiar cache
router.get('/limpiar', (req, res) => {
  cache.fecha = null;
  cache.datos = null;
  res.json({ status: 'ok', mensaje: 'Cache limpiada' });
});

export default router;