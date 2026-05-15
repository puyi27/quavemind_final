import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { añadirQuavePoints, registrarResultadoJuego } from '../lib/userStats.js';

const router = Router();
const DEEZER_API_BASE = 'https://' + 'api.' + 'deezer.' + 'com';
const LRCLIB_API_BASE = 'https://' + 'lrclib.' + 'net/api';

// Aseguramos compatibilidad con versiones antiguas de Node si fuera necesario
const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(5000) // Timeout de 5s para evitar bloqueos
    });
    return response;
  } catch (err) {
    console.error(`[QUAVEDLE_ERROR] Fallo al conectar con ${url}:`, err.message);
    return { ok: false, json: async () => ({ data: [] }) };
  }
};

const getSeedFromDate = () => {
  const hoy = new Date();
  return hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
};

const selectWithSeed = (array, seed, offset = 0) => {
  if (!array || array.length === 0) return null;
  const x = Math.sin(seed + offset) * 10000;
  const random = x - Math.floor(x);
  return array[Math.floor(random * array.length)];
};

const ARTISTAS = [
  // URBANO LATINO / REGGAETON / TRAP (Existentes + Refuerzos)
  'Bad Bunny', 'Karol G', 'Feid', 'Rauw Alejandro', 'Ozuna', 'Anuel AA',
  'Myke Towers', 'Mora', 'Eladio Carrion', 'Jhayco', 'Sech', 'Dalex',
  'Duki', 'Bizarrap', 'Trueno', 'Milo J', 'Nicki Nicole', 'Emilia',
  'Tiago PZK', 'Maria Becerra', 'LIT Killah', 'KHEA', 'Paulo Londra',
  'Peso Pluma', 'Natanael Cano', 'Junior H', 'Quevedo', 'Morad',
  'C Tangana', 'Rosalia', 'Rels B', 'Saiko', 'Cruz Cafune',
  'Yandel', 'Daddy Yankee', 'J Balvin', 'Maluma', 'Nathy Peluso',
  'Lunay', 'Anitta', 'Becky G', 'Tini', 'Cazzu', 'Rusherking',
  'Big One', 'FMK', 'WOS', 'Coscu', 'Neo Pistea', 'C.R.O', 'YSY A',
  'Jhay Cortez', 'Arcangel', 'Chencho Corleone', 'Bryant Myers', 'De La Ghetto',
  'Wisín & Yandel', 'Don Omar', 'Tego Calderon', 'Ivy Queen', 'Zion & Lennox',
  'Plan B', 'Ñengo Flow', 'Farruko', 'Justin Quiles', 'Luar La L', 'Hovicky',
  'Youngchimi', 'Brytiago', 'Noriel', 'Jon Z', 'Darell', 'Pusho', 'Mikie Woodz',
  'Beny Jr', 'Lucho RK', 'Young Miko', 'Dei V', 'Omar Courtz',

  // HIP HOP ESPAÑA
  'Kase.O', 'Nach', 'SFDK', 'Mala Rodriguez', 'Ayax y Prok', 'Foyone', 'Hard GZ', 
  'Fernandocosta', 'Natos y Waor', 'Jarfaiter', 'ToteKing', 'Sho-Hai', 'Violadores del Verso',
  'El Piezas', 'Rayden', 'Sharif', 'Rapsusklei', 'Falsalarma', 'Juancho Marqués', 'Recycled J',
  '7 Notas 7 Colores', 'CPV', 'Chojin', 'Duo Kie', 'Hablando en Plata', 'Capaz',

  // HIP HOP / RAP LATAM
  'Acru', 'Akapellah', 'Nanpa Básico', 'Homer el Mero Mero', 'Canserbero', 'Residente', 
  'Calle 13', 'Santa Fe Klan', 'Gera MX', 'Alemán', 'Cartel de Santa', 'Lil Supa', 
  'Apache', 'Rxnde Akozta', 'Alcolirykoz', 'Movimiento Original', 'Portavoz', 
  'Tiro de Gracia', 'Ana Tijoux', 'Control Machete', 'Caballeros del Plan G'
];

const getTracksWithPreview = async (isDaily, seed) => {
  const shuffled = isDaily
    ? ARTISTAS.slice(seed % ARTISTAS.length, (seed % ARTISTAS.length) + 8)
    : [...ARTISTAS].sort(() => 0.5 - Math.random()).slice(0, 8);

  for (const artista of shuffled) {
    try {
      const resp = await safeFetch(`${DEEZER_API_BASE}/search?q=${encodeURIComponent(artista)}&limit=50`);
      const data = await resp.json();
      const blacklist = ['blackbear', 'gayle', 'central cee', 'dave', 'stormzy'];
      const tracks = (data.data || []).filter((t) => 
        t.preview && 
        t.title && 
        t.artist?.name &&
        !blacklist.some(word => t.title.toLowerCase().includes(word) || t.artist.name.toLowerCase().includes(word))
      );
      if (tracks.length > 5) return tracks;
    } catch (e) {
      continue;
    }
  }
  return [];
};

const getAlbumsFromDeezer = async (isDaily, seed) => {
  const artista = isDaily
    ? ARTISTAS[seed % ARTISTAS.length]
    : ARTISTAS[Math.floor(Math.random() * ARTISTAS.length)];

  for (let i = 0; i < 6; i += 1) {
    const q = isDaily ? artista : ARTISTAS[Math.floor(Math.random() * ARTISTAS.length)];
    try {
      const resp = await safeFetch(`${DEEZER_API_BASE}/search/album?q=${encodeURIComponent(q)}&limit=30`);
      const data = await resp.json();
      const albums = (data.data || []).filter((a) => 
        a.cover_big && 
        a.title && 
        a.artist?.name && 
        (a.nb_tracks === undefined || a.nb_tracks > 5)
      );
      if (albums.length > 0) return albums;
    } catch (e) {
      continue;
    }
  }
  return [];
};

const getArtistsFromDeezer = async (isDaily, seed) => {
  const q = isDaily
    ? ARTISTAS[seed % ARTISTAS.length]
    : ARTISTAS[Math.floor(Math.random() * ARTISTAS.length)];

  try {
    const resp = await safeFetch(`${DEEZER_API_BASE}/search/artist?q=${encodeURIComponent(q)}&limit=5`);
    const data = await resp.json();
    return (data.data || []).filter((a) => 
      a.picture_big && 
      a.name && 
      (a.name.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(a.name.toLowerCase())) &&
      a.nb_fan > 50000
    );
  } catch (e) {
    return [];
  }
};

const getLyricsBlock = async (artistName, trackName) => {
  try {
    const res = await safeFetch(`${LRCLIB_API_BASE}/search?q=${encodeURIComponent(artistName + ' ' + trackName)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const match = data?.[0];
    if (!match?.plainLyrics) return null;

    const lineas = match.plainLyrics
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 10 && l.length < 140 && !l.startsWith('['));

    if (lineas.length < 2) return null;

    const inicio = Math.floor(Math.random() * Math.max(1, lineas.length - 8));
    return { lineas, inicio };
  } catch (e) {
    return null;
  }
};

router.get('/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const modo = req.query.modo || 'infinite';
    const isDaily = modo === 'daily' && tipo !== 'maraton' && tipo !== 'contrarreloj';

    let activeType = tipo;
    if (tipo === 'maraton' || tipo === 'contrarreloj') {
      const allTypes = ['songdle', 'artist', 'cover', 'lyrics'];
      activeType = allTypes[Math.floor(Math.random() * allTypes.length)];
    }

    const seed = isDaily ? getSeedFromDate() : Math.floor(Math.random() * ARTISTAS.length * 1000);
    let challenge = null;

    const censurar = (texto, terminos = []) => {
      let resultado = texto;
      terminos.forEach(t => {
        if (!t) return;
        const regex = new RegExp(t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi');
        resultado = resultado.replace(regex, '[CENSURADO]');
      });
      return resultado;
    };

    if (activeType === 'songdle' || activeType === 'lyrics') {
      const tracks = await getTracksWithPreview(isDaily, seed);
      if (tracks.length === 0) {
        return res.status(503).json({ status: 'error', mensaje: 'No hay canciones disponibles ahora mismo. Reintenta.' });
      }

      const track = isDaily ? selectWithSeed(tracks, seed, 1) : tracks[Math.floor(Math.random() * tracks.length)];
      if (!track) return res.status(503).json({ status: 'error', mensaje: 'No se pudo seleccionar una canción. Reintenta.' });

      if (activeType === 'songdle') {
        challenge = {
          tipo: 'songdle',
          id: String(track.id),
          nombre: track.title,
          artista: track.artist.name,
          imagen: track.album?.cover_big || track.album?.cover_medium,
          preview: track.preview,
        };
      } else {
        const lyricsBlock = await getLyricsBlock(track.artist.name, track.title);
        const fallbackLine = 'Una canción urbana que resuena en todos lados.';
        const lineaOriginal = lyricsBlock?.lineas?.[lyricsBlock?.inicio || 0] || fallbackLine;
        
        challenge = {
          tipo: 'lyrics',
          id: String(track.id),
          nombre: track.title,
          artista: track.artist.name,
          imagen: track.album?.cover_big || track.album?.cover_medium,
          preview: track.preview,
          letraOriginal: lineaOriginal,
          letra: censurar(lineaOriginal, [track.artist.name, track.title]),
          lineas: (lyricsBlock?.lineas || [fallbackLine]).map(l => censurar(l, [track.artist.name, track.title])),
          inicio: lyricsBlock?.inicio || 0,
        };
      }
    } else if (activeType === 'cover') {
      const albums = await getAlbumsFromDeezer(isDaily, seed);
      const selectedItem = isDaily ? selectWithSeed(albums, seed, 2) : albums[Math.floor(Math.random() * albums.length)];

      if (!selectedItem) {
        return res.status(503).json({ status: 'error', mensaje: 'No hay contenido disponible. Reintenta.' });
      }

      const artName = selectedItem.artist?.name || 'Artista Desconocido';
      let releaseYear = selectedItem.release_date?.substring(0, 4) || '???';
      let totalTracks = selectedItem.nb_tracks;

      try {
        const detailResp = await safeFetch(`${DEEZER_API_BASE}/album/${selectedItem.id}`);
        const detailData = await detailResp.json();
        releaseYear = detailData.release_date?.substring(0, 4) || releaseYear;
        totalTracks = detailData.nb_tracks || totalTracks;
      } catch (e) {}

      const clues = [
        `LANZAMIENTO: ${releaseYear} • ${totalTracks || '?'} CANCIONES`,
        `INICIALES: ARTISTA "${artName.charAt(0).toUpperCase()}" • ÁLBUM "${selectedItem.title.charAt(0).toUpperCase()}"`,
        `ARTISTA: ${artName}`
      ];

      challenge = {
        tipo: 'cover',
        id: String(selectedItem.id),
        nombre: selectedItem.title,
        artista: artName,
        imagen: selectedItem.cover_big,
        fecha: releaseYear,
        clues,
        esCancion: false
      };
    } else if (activeType === 'artist') {
      const artists = await getArtistsFromDeezer(isDaily, seed);
      if (artists.length === 0) {
        return res.status(503).json({ status: 'error', mensaje: 'No hay artistas disponibles. Reintenta.' });
      }

      const targetName = isDaily ? ARTISTAS[seed % ARTISTAS.length] : '';
      const artist = isDaily
        ? (artists.find(a => a.name.toLowerCase() === targetName.toLowerCase()) || artists[0])
        : artists[Math.floor(Math.random() * artists.length)];

      if (!artist) {
        return res.status(503).json({ status: 'error', mensaje: 'No se pudo seleccionar un artista. Reintenta.' });
      }

      const nombreLimpio = artist.name.replace(/\s+/g, ' ').trim();

      // Hidratar: top tracks, álbumes y artistas relacionados
      let topTracks = [];
      let topAlbums = [];
      let relatedArtists = [];
      let genero = '';

      try {
        const [tracksResp, albumsResp, relatedResp] = await Promise.all([
          safeFetch(`${DEEZER_API_BASE}/artist/${artist.id}/top?limit=10`),
          safeFetch(`${DEEZER_API_BASE}/artist/${artist.id}/albums?limit=5`),
          safeFetch(`${DEEZER_API_BASE}/artist/${artist.id}/related?limit=6`),
        ]);
        const [tData, aData, rData] = await Promise.all([
          tracksResp.json(), albumsResp.json(), relatedResp.json()
        ]);

        topTracks = (tData.data || []).map(t => t.title).filter(Boolean);
        topAlbums = (aData.data || []).map(a => a.title).filter(Boolean);
        relatedArtists = (rData.data || []).map(a => a.name).filter(Boolean).slice(0, 4);

        // Género desde el primer track del artista si tiene
        genero = tData.data?.[0]?.type || '';
      } catch (e) {}

      // Buscar colaboraciones reales: canciones donde aparece otro artista
      let colabs = [];
      try {
        const searchResp = await safeFetch(`${DEEZER_API_BASE}/search?q=${encodeURIComponent(nombreLimpio)}&limit=30`);
        const searchData = await searchResp.json();
        const tracks = searchData.data || [];
        // Buscar tracks donde el nombre del artista aparece pero hay otro artista (feat)
        const featTracks = tracks.filter(t =>
          (t.title?.toLowerCase().includes('feat') || t.title?.toLowerCase().includes('ft.') || t.title?.includes('&')) &&
          (t.artist?.name?.toLowerCase().includes(nombreLimpio.toLowerCase()) ||
           t.title?.toLowerCase().includes(nombreLimpio.toLowerCase()))
        );
        colabs = [...new Set(featTracks
          .map(t => t.artist?.name)
          .filter(n => n && !n.toLowerCase().includes(nombreLimpio.toLowerCase()))
        )].slice(0, 3);

        // También buscar artistas de las canciones del artista
        if (colabs.length === 0) {
          colabs = [...new Set(tracks
            .filter(t => t.artist?.name && !t.artist.name.toLowerCase().includes(nombreLimpio.toLowerCase()) &&
              t.title?.toLowerCase().includes(nombreLimpio.toLowerCase()))
            .map(t => t.artist.name)
          )].slice(0, 3);
        }
      } catch (e) {}

      // ─── PISTAS PROGRESIVAS (de más difícil a más fácil) ────────────────────
      const fansFormat = new Intl.NumberFormat('es-ES').format(artist.nb_fan || 0);
      const nivelFama = artist.nb_fan > 10_000_000 ? 'una superestrella global'
        : artist.nb_fan > 3_000_000 ? 'un líder de la escena urbana'
        : artist.nb_fan > 500_000 ? 'un artista con fuerte presencia en Latinoamérica'
        : 'un artista emergente con base de fans fiel';

      const clues = [];

      // Pista 1: Nivel de fama + relaciones con artistas similares (sin dar el nombre)
      clues.push(
        relatedArtists.length > 1
          ? `ESCENA: Es ${nivelFama}. Su música es similar a la de ${relatedArtists.slice(0, 2).join(' y ')}.`
          : `IMPACTO: Es ${nivelFama} con ${fansFormat} seguidores en Deezer.`
      );

      // Pista 2: Colaboraciones concretas
      clues.push(
        colabs.length > 0
          ? `COLABORACIONES: Ha trabajado con ${colabs.join(', ')}.`
          : relatedArtists.length > 2
          ? `ESCENA: Comparte escena con artistas como ${relatedArtists.slice(1, 3).join(' y ')}.`
          : `TRAYECTORIA: Tiene ${fansFormat} seguidores y lleva varios años activo en la escena.`
      );

      // Pista 3: Álbum real
      clues.push(
        topAlbums.length > 0
          ? `ÁLBUM: Uno de sus proyectos se titula "${censurar(topAlbums[0], [nombreLimpio])}".`
          : `CARRERA: Ha publicado múltiples proyectos discográficos y sencillos.`
      );

      // Pista 4: Canción real (censurar el nombre del artista)
      clues.push(
        topTracks.length > 0
          ? `HIT: Una de sus canciones más escuchadas es "${censurar(topTracks[0], [nombreLimpio])}".`
          : topAlbums.length > 1
          ? `OTRO ÁLBUM: También tiene un proyecto llamado "${censurar(topAlbums[1], [nombreLimpio])}".`
          : `NOMBRE: Su nombre artístico tiene ${nombreLimpio.length} letras.`
      );

      // Pista 5: Nombre con inicial y longitud (hint de emergencia)
      clues.push(
        `IDENTIDAD: Su nombre artístico empieza por "${nombreLimpio.charAt(0)}", termina por "${nombreLimpio.charAt(nombreLimpio.length - 1)}" y tiene ${nombreLimpio.length} caracteres en total.`
      );

      challenge = {
        tipo: 'artist',
        id: String(artist.id),
        nombre: artist.name,
        imagen: artist.picture_big,
        seguidores: artist.nb_fan,
        popularidad: Math.min(100, Math.max(1, Math.round(Math.log10((artist.nb_fan || 1000)) * 20))),
        clues,
        descripcion: `Agente de la escena urbana. Inicial: ${nombreLimpio.charAt(0)}.`
      };
    }

    if (!challenge) {
      return res.status(503).json({ status: 'error', mensaje: 'No se pudo preparar el reto. Reintenta.' });
    }

    return res.json({ status: 'ok', modo: isDaily ? 'daily' : 'infinite', pista: challenge });
  } catch (error) {
    console.error('Error en /api/quavedle/:tipo:', error.message);
    return res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

/**
 * Ruta para guardar el resultado de una partida y asignar puntos.
 * Solo para usuarios autenticados.
 */
router.post('/save-result', authenticate, async (req, res) => {
  try {
    const { puntuacion, juego, metadatos, gano } = req.body;
    const usuarioId = req.usuario.id;

    if (!juego || puntuacion === undefined) {
      return res.status(400).json({ status: 'error', mensaje: 'Faltan datos de la partida.' });
    }

    // 1. Registramos el resultado de la partida
    await registrarResultadoJuego(usuarioId, juego, puntuacion, metadatos);

    // 2. Si ganó, le damos puntos (ej. 100 puntos por victoria)
    let puntosGanados = 0;
    let usuarioActualizado = null;

    if (gano) {
      puntosGanados = puntuacion || 100; // Por defecto 100 si no viene puntuación específica
      usuarioActualizado = await añadirQuavePoints(usuarioId, puntosGanados, `${juego}_win`);
    }

    res.json({
      status: 'ok',
      mensaje: gano ? `¡Felicidades! Has ganado ${puntosGanados} Quave Points.` : 'Partida registrada.',
      puntosGanados,
      totalPuntos: usuarioActualizado ? usuarioActualizado.quavePoints : req.usuario.quavePoints
    });

  } catch (error) {
    console.error('Error al guardar resultado de Quavedle:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al procesar los puntos.' });
  }
});

export default router;
