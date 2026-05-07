import 'dotenv/config'; 
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Client } from 'genius-lyrics';
import prisma from './db.js';
import { slidingWindowRateLimiter } from './middleware/rateLimiter.js';
import { getCachedData, cacheData } from './lib/redis.js';
import { getSpotifyToken, fetchJsonWithRetry, SPOTIFY_API_BASE } from './lib/spotify.js';
import quavedleRoutes from './routes/quavedle.js';
import musicRoutes from './routes/music.js';
import anotacionesRoutes from './routes/anotaciones.js';
import versoOcultoRoutes from './routes/versoOculto.js';
import radarRoutes from './routes/radar.js';
import recomendacionesRoutes from './routes/recomendacionesDiarias.js';
import testRoutes from './routes/testRecomendaciones.js';
import authRoutes from './routes/auth.js';
import generadorRoutes from './routes/generador.js';
import vaultRoutes from './routes/vault.js';
import artistasRoutes from './routes/artistas.js';
import adminRoutes from './routes/admin.js';
import { getRealArtistStats } from './lib/stats.js';
import { normalizeArtistList } from './lib/artistValidator.js';

const app = express();
const genius = process.env.GENIUS_ACCESS_TOKEN ? new Client(process.env.GENIUS_ACCESS_TOKEN) : null;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin.includes('localhost')) return true;
  if (origin.includes('vercel.app')) return true;
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Rutas modulares
app.use('/api/quavedle', quavedleRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/anotaciones', anotacionesRoutes);
app.use('/api/verso-oculto', versoOcultoRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/recomendaciones', recomendacionesRoutes);
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/generador', generadorRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/artistas', artistasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/music/artistas', artistasRoutes);

const SPOTIFY_OPEN_BASE = 'https://open.spotify.com';
const MUSICBRAINZ_USER_AGENT = 'QuavemindTFG/1.0.0 ( quavemind.project@example.com )';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_URBAN_HOST = process.env.RAPIDAPI_URBAN_HOST || 'mashape-community-urban-dictionary.p.rapidapi.com';
const RAPIDAPI_URBAN_URL = process.env.RAPIDAPI_URBAN_URL || `https://${RAPIDAPI_URBAN_HOST}`;

// Utilidad movida a lib/stats.js

const limpiarUrbanText = (value) => `${value || ''}`.replace(/\[(.*?)\]/g, '$1').replace(/\r?\n+/g, ' ').trim();
const limpiarTexto = (value) => `${value || ''}`.replace(/\[(.*?)\]/g, '$1').replace(/\r?\n+/g, ' ').trim();
const decodeHtmlEntities = (value) => `${value || ''}`.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/<[^>]+>/g, ' ').trim();
const normalizarBusqueda = (value) => `${value || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const normalizarClaveQuavedle = (value) => normalizarBusqueda(value).replace(/[^a-z0-9]+/g, '');

const puntuarJerga = (entrada, query) => {
  const termino = normalizarBusqueda(entrada.termino);
  if (!query) return 0;
  if (termino === query) return 100;
  if (termino.startsWith(query)) return 80;
  if (termino.includes(query)) return 60;
  return 0;
};

// Rutas Misceláneas (Jerga, Deezer, etc.)
app.get('/api/jerga/urban', async (req, res) => {
  const query = `${req.query.q || ''}`.trim();
  if (!query) return res.json({ status: 'ok', entradas: [], proveedor: 'urban_dictionary' });
  try {
    const response = await fetch(`${RAPIDAPI_URBAN_URL}/define?term=${encodeURIComponent(query)}`, { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_URBAN_HOST } });
    const data = await response.json();
    const entradas = (data.list || []).slice(0, 8).map((item, index) => ({
      id: `urban-${index}`, termino: limpiarUrbanText(item.word || query), significado: limpiarUrbanText(item.definition), contexto: limpiarUrbanText(item.example), fuente: 'urban_dictionary'
    }));
    return res.json({ status: 'ok', entradas, proveedor: 'urban_dictionary' });
  } catch (error) { return res.status(500).json({ status: 'error', entradas: [] }); }
});

app.get('/api/quavedle/deezer-track', async (req, res) => {
  const query = `${req.query.q || ''}`.trim();
  if (!query) return res.status(400).json({ status: 'error', mensaje: 'Busqueda vacia' });
  try {
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    const track = data.data?.[0];
    if (!track) return res.status(404).json({ status: 'error' });
    return res.json({ status: 'ok', track: { id: track.id, nombre: track.title, artista: track.artist?.name, preview: track.preview, imagen: track.album?.cover_xl } });
  } catch (error) { return res.status(500).json({ status: 'error' }); }
});

app.get('/api/quavedle/spotify-album', async (req, res) => {
  const searchText = `${req.query.q || req.query.album} ${req.query.artist || ''}`.trim();
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(searchText)}&type=album&limit=5`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    const albumSeleccionado = data.albums?.items?.[0];
    if (!albumSeleccionado) return res.status(404).json({ status: 'error' });
    return res.json({ status: 'ok', album: { id: albumSeleccionado.id, nombre: albumSeleccionado.name, artista: albumSeleccionado.artists?.[0]?.name, imagen: albumSeleccionado.images?.[0]?.url, fecha: albumSeleccionado.release_date?.substring(0, 4) } });
  } catch (error) { return res.status(500).json({ status: 'error' }); }
});

app.get('/api/quavedle/spotify-artist', async (req, res) => {
  const searchText = `${req.query.q || req.query.artist}`.trim();
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(searchText)}&type=artist&limit=5`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    const artistaSeleccionado = data.artists?.items?.[0];
    if (!artistaSeleccionado) return res.status(404).json({ status: 'error' });
    return res.json({ status: 'ok', artist: { id: artistaSeleccionado.id, nombre: artistaSeleccionado.name, imagen: artistaSeleccionado.images?.[0]?.url, popularidad: Number(artistaSeleccionado.popularity || 0) } });
  } catch (error) { return res.status(500).json({ status: 'error' }); }
});

// ==========================================
// 🚀 RUTAS DE BÚSQUEDA Y PERFILES (UNIVERSALES)
// ==========================================

// Redirección de búsqueda para compatibilidad
app.get('/api/buscar', (req, res) => {
  res.redirect(307, `/api/music/buscar?${new URLSearchParams(req.query).toString()}`);
});

// ==========================================
// RUTAS DE ARTISTAS (Compatibilidad Escenas/Géneros)
// ==========================================
// Las rutas de artistas (/bulk y GET por ID) han sido movidas a routes/artistas.js


// 🔥 RESTAURADA: PERFIL DE ARTISTA 🔥
app.get(['/api/artista/:id', '/api/music/artista/:id'], async (req, res) => {
  const { id } = req.params;

  // Sanitización de IDs corruptos o marcadores de posición
  if (!id || id.length < 15 || id.includes('j1k2l') || id === 'undefined' || id === 'null') {
    return res.json({ 
      status: 'ok', 
      artista: {
        id,
        nombre: 'Agente Desconocido',
        imagen: 'https://via.placeholder.com/300?text=Expediente+Incompleto',
        seguidores: 0,
        popularidad: 0,
        generos: ['Underground'],
        oyentesMensuales: 0,
        biografia: 'Este expediente no está disponible o ha sido eliminado de la red central.',
        tracks: [],
        albumes: [],
        related: [],
        external_urls: { spotify: '#' }
      }
    });
  }

  try {
    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [artistaRes, topTracksRes, albumsRes, relatedRes, realStats] = await Promise.all([
      fetch(`${SPOTIFY_API_BASE}/artists/${id}`, { headers }),
      fetch(`${SPOTIFY_API_BASE}/artists/${id}/top-tracks?market=ES`, { headers }),
      fetch(`${SPOTIFY_API_BASE}/artists/${id}/albums?include_groups=album&limit=50`, { headers }),
      fetch(`${SPOTIFY_API_BASE}/artists/${id}/related-artists`, { headers }),
      getRealArtistStats(id),
    ]);

    if (!artistaRes.ok) {
      // Si el artista no existe en Spotify, devolvemos un objeto parcial en lugar de 400/404
      return res.json({ 
        status: 'ok', 
        artista: { 
          id, 
          nombre: 'Artista no encontrado', 
          imagen: '/default.png',
          popularidad: 0,
          seguidores: 0,
          generos: [],
          biografia: 'Este expediente no existe en los servidores centrales de Spotify.'
        },
        topTracks: [],
        canciones: [],
        albumes: [],
        relacionados: []
      });
    }

    const artistaData = await artistaRes.json();
    const topTracksData = topTracksRes.ok ? await topTracksRes.json() : { tracks: [] };
    const albumsData = albumsRes.ok ? await albumsRes.json() : { items: [] };
    const relatedData = relatedRes.ok ? await relatedRes.json() : { artists: [] };

    const normalizarGenero = (g) => `${g || ''}`.toLowerCase().trim();
    const generosBase = (artistaData.genres || []).map(normalizarGenero);

    const scoreRelacion = (candidate) => {
      const candGenres = (candidate.genres || []).map(normalizarGenero);
      const inter = candGenres.filter((g) => generosBase.some((bg) => bg.includes(g) || g.includes(bg)));
      const genreScore = generosBase.length > 0 ? Math.min(1, inter.length / Math.max(1, generosBase.length)) * 55 : 20;
      const popScore = Math.max(0, 25 - Math.abs((candidate.popularity || 0) - (artistaData.popularity || 0)) * 0.5);
      const baseFollowers = artistaData.followers?.total || 1;
      const candFollowers = candidate.followers?.total || 1;
      const ratio = Math.min(baseFollowers, candFollowers) / Math.max(baseFollowers, candFollowers);
      const followerScore = ratio * 20;
      return Math.round(Math.max(1, Math.min(100, genreScore + popScore + followerScore)));
    };

    const collabCountByArtistId = new Map();
    (topTracksData.tracks || []).forEach((track) => {
      (track.artists || []).forEach((artist) => {
        if (!artist?.id || artist.id === id) return;
        collabCountByArtistId.set(artist.id, (collabCountByArtistId.get(artist.id) || 0) + 1);
      });
    });

    const collabIds = Array.from(collabCountByArtistId.keys()).slice(0, 40);
    let collabArtists = [];

    if (collabIds.length > 0) {
      const collabData = await fetchJsonWithRetry(
        `${SPOTIFY_API_BASE}/artists?ids=${encodeURIComponent(collabIds.join(','))}`,
        { headers },
        1
      );

      collabArtists = (collabData.artists || []).filter(Boolean).map((artist) => {
        const sharedTracks = collabCountByArtistId.get(artist.id) || 1;
        return {
          id: artist.id,
          nombre: artist.name,
          imagen: artist.images?.[0]?.url || '/default.png',
          seguidores: artist.followers?.total || 0,
          popularidad: artist.popularity || 0,
          generos: artist.genres || [],
          spotifyUrl: artist.external_urls?.spotify,
          sharedTracks,
          esColaborador: true,
          scoreConexion: Math.min(100, 86 + (sharedTracks * 7)),
          tipoConexion: 'collab_track',
          nivel: 1
        };
      });
    }

    const directosSpotify = (relatedData.artists || []).map((r) => ({
      id: r.id,
      nombre: r.name,
      imagen: r.images?.[0]?.url || '/default.png',
      seguidores: r.followers?.total || 0,
      popularidad: r.popularity || 0,
      generos: r.genres || [],
      spotifyUrl: r.external_urls?.spotify,
      scoreConexion: scoreRelacion(r),
      esColaborador: collabCountByArtistId.has(r.id),
      sharedTracks: collabCountByArtistId.get(r.id) || 0,
      tipoConexion: 'spotify_related',
      nivel: 1
    }));

    const mapRelacionados = new Map();
    [...collabArtists, ...directosSpotify].forEach((r) => {
      if (!r?.id || r.id === id) return;
      const prev = mapRelacionados.get(r.id);
      if (!prev) {
        mapRelacionados.set(r.id, r);
        return;
      }

      const next = { ...prev, ...r };
      next.esColaborador = Boolean(prev.esColaborador || r.esColaborador);
      next.sharedTracks = Math.max(Number(prev.sharedTracks || 0), Number(r.sharedTracks || 0));
      next.scoreConexion = Math.max(Number(prev.scoreConexion || 0), Number(r.scoreConexion || 0));
      next.tipoConexion =
        next.esColaborador && (prev.tipoConexion === 'spotify_related' || r.tipoConexion === 'spotify_related')
          ? 'collab_track+spotify_related'
          : (next.esColaborador ? 'collab_track' : 'spotify_related');

      mapRelacionados.set(r.id, next);
    });

    const relacionados = Array.from(mapRelacionados.values())
      .sort((a, b) => {
        const collabDiff = Number(Boolean(b.esColaborador)) - Number(Boolean(a.esColaborador));
        if (collabDiff !== 0) return collabDiff;
        const sharedDiff = Number(b.sharedTracks || 0) - Number(a.sharedTracks || 0);
        if (sharedDiff !== 0) return sharedDiff;
        return Number(b.scoreConexion || 0) - Number(a.scoreConexion || 0);
      })
      .slice(0, 80);

    const uniqueAlbumesMap = new Map();
    (albumsData.items || []).forEach((album) => {
      if (!album || album.album_type !== 'album') return;
      const ano = album.release_date?.substring(0, 4) || '';
      const clave = `${(album.name || '').toLowerCase().trim()}__${ano}`;
      if (!uniqueAlbumesMap.has(clave)) uniqueAlbumesMap.set(clave, album);
    });

    const albumes = Array.from(uniqueAlbumesMap.values()).map((a) => ({
        id: a.id,
        nombre: a.name,
        imagen: a.images?.[0]?.url || '/default.png',
        ano: a.release_date?.substring(0, 4) || '',
        fecha: a.release_date?.substring(0, 4) || '',
        total_canciones: a.total_tracks || 0,
        spotifyUrl: a.external_urls?.spotify
      }));

    const albumesParaCatalogo = albumes.slice(0, 12);
    const tracksPorAlbum = await Promise.all(
      albumesParaCatalogo.map(async (album) => {
        try {
          const data = await fetchJsonWithRetry(
            `${SPOTIFY_API_BASE}/albums/${album.id}/tracks?limit=50`,
            { headers },
            1
          );
          return (data.items || []).map((track) => ({
            id: track.id,
            nombre: track.name,
            imagen: album.imagen,
            preview: track.preview_url || null,
            duracion: track.duration_ms,
            duracion_ms: track.duration_ms,
            spotifyUrl: track.external_urls?.spotify || null,
            artistas: (track.artists || []).map((a) => ({ id: a.id, nombre: a.name })),
          }));
        } catch {
          return [];
        }
      })
    );

    const catalogoMap = new Map();
    (topTracksData.tracks || []).forEach((track) => {
      if (!track?.id) return;
      catalogoMap.set(track.id, {
        id: track.id,
        nombre: track.name,
        imagen: track.album?.images?.[0]?.url,
        preview: track.preview_url,
        duracion: track.duration_ms,
        duracion_ms: track.duration_ms,
        spotifyUrl: track.external_urls?.spotify,
        artistas: (track.artists || []).map((a) => ({ id: a.id, nombre: a.name })),
      });
    });

    tracksPorAlbum.flat().forEach((track) => {
      if (!track?.id || catalogoMap.has(track.id)) return;
      catalogoMap.set(track.id, track);
    });

    const canciones = Array.from(catalogoMap.values())
      .sort((a, b) => {
        if (a.preview && !b.preview) return -1;
        if (!a.preview && b.preview) return 1;
        return 0;
      })
      .slice(0, 220);

    res.json({
      status: 'ok',
      artista: {
        id: artistaData.id,
        nombre: artistaData.name,
        imagen: artistaData.images?.[0]?.url,
        seguidores: artistaData.followers?.total,
        generos: artistaData.genres,
        popularidad: artistaData.popularity,
        oyentesMensuales: realStats.listeners || null,
        oyentesVerificados: realStats.listeners !== null,
        biografia: realStats.bio || null,
        spotifyUrl: artistaData.external_urls?.spotify
      },
      topTracks: (topTracksData.tracks || [])
        .map((t) => ({
          id: t.id,
          nombre: t.name,
          imagen: t.album?.images?.[0]?.url,
          preview: t.preview_url,
          duracion: t.duration_ms,
          duracion_ms: t.duration_ms,
          spotifyUrl: t.external_urls?.spotify,
          artistas: (t.artists || []).map((a) => ({ id: a.id, nombre: a.name }))
        }))
        .sort((a, b) => {
          if (a.preview && !b.preview) return -1;
          if (!a.preview && b.preview) return 1;
          return 0;
        }),
      canciones,
      albumes,
      relacionados
    });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

app.get(['/api/cancion/:id', '/api/music/cancion/:id'], async (req, res) => {
  const { id } = req.params;
  
  // 1. Fallback inmediato para IDs de marcador (evita 500 y 404 innecesarios)
  if (!id || id.length < 10 || id === 'track1' || id === 'undefined' || id === 'null') {
    return res.json({
      status: 'ok',
      cancion: {
        id: id || 'unknown',
        nombre: 'Archivo Clasificado',
        artistaPrincipal: 'Agente Desconocido',
        album: 'Bóveda Central',
        imagen: '/default.png',
        duracion: 180000,
        bpm: 120,
        energy: 0.5,
        preview: null
      }
    });
  }

  try {
    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [trackRes, featuresRes] = await Promise.all([
      fetch(`${SPOTIFY_API_BASE}/tracks/${id}`, { headers }).catch(() => ({ ok: false })),
      fetch(`${SPOTIFY_API_BASE}/audio-features/${id}`, { headers }).catch(() => ({ ok: false })),
    ]);

    if (!trackRes || !trackRes.ok) {
       return res.status(404).json({ status: 'error', mensaje: 'Cancion no encontrada en Spotify' });
    }

    const track = await trackRes.json();
    const features = (featuresRes && featuresRes.ok) ? await featuresRes.json() : {};

    if (!track || !track.id) {
       return res.status(404).json({ status: 'error', mensaje: 'Cancion no encontrada' });
    }

    return res.json({
      status: 'ok',
      cancion: {
        id: track.id, 
        nombre: track.name, 
        artista: (track.artists || []).map(a => a.name).join(', '), 
        artistaPrincipal: track.artists?.[0]?.name || 'Desconocido',
        artistas: (track.artists || []).map(a => ({ id: a.id, nombre: a.name })), 
        artistaId: track.artists?.[0]?.id, 
        album: track.album?.name || 'Desconocido',
        albumId: track.album?.id,
        imagen: track.album?.images?.[0]?.url || '/default.png', 
        fecha: track.album?.release_date, 
        duracion: track.duration_ms, 
        preview: track.preview_url, 
        spotifyUrl: track.external_urls?.spotify,
        bpm: features.tempo ? Math.round(features.tempo) : 'N/A', 
        key: features.key !== undefined ? features.key : 'N/A', 
        energy: features.energy || 0,
      },
    });
  } catch (error) {
    console.error('Error en ruta cancion:', error.message);
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }
});

app.get(['/api/recomendaciones/cancion/:id', '/api/music/recomendaciones/cancion/:id'], async (req, res) => {
  const { id } = req.params;
  if (!id || id === 'undefined') return res.json({ status: 'ok', recomendaciones: [] });

  try {
    const token = await getSpotifyToken();
    const url = `${SPOTIFY_API_BASE}/recommendations?seed_tracks=${encodeURIComponent(id)}&limit=6`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    
    if (!response.ok) {
       // Si es 404 o similar, devolvemos vacio en vez de error
       return res.json({ status: 'ok', recomendaciones: [] });
    }

    const data = await response.json();
    const recomendaciones = (data.tracks || []).map((track) => ({
      id: track.id, 
      nombre: track.name, 
      artista: (track.artists || []).map(a => a.name).join(', '), 
      imagen: track.album?.images?.[0]?.url || '/default.png', 
      preview: track.preview_url, 
      duracion: track.duration_ms
    }));
    return res.json({ status: 'ok', recomendaciones });
  } catch (error) { 
    console.error(`ERROR en recomendaciones canción ${id}:`, error.message);
    return res.json({ status: 'ok', recomendaciones: [] }); 
  }
});

app.get(['/api/album/:id', '/api/music/album/:id'], async (req, res) => {
  const { id } = req.params;
  
  if (!id || id.length < 10 || id === 'undefined' || id === 'album1') {
    return res.json({
      status: 'ok',
      album: { 
        id, nombre: 'Proyecto Clasificado', imagen: '/default.png', 
        artista: 'Agente Desconocido', fecha: '2024', totalTracks: 0 
      },
      tracks: []
    });
  }

  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${SPOTIFY_API_BASE}/albums/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    
    if (!response.ok) {
       return res.status(response.status).json({ status: 'error', mensaje: 'Album no encontrado' });
    }

    const data = await response.json();
    return res.json({
      status: 'ok',
      album: { 
        id: data.id, 
        nombre: data.name, 
        imagen: data.images?.[0]?.url || '/default.png', 
        artista: (data.artists || []).map(a => a.name).join(', '), 
        artistaId: data.artists?.[0]?.id, 
        fecha: data.release_date?.substring(0, 4), 
        totalTracks: data.total_tracks || 0,
        spotifyUrl: data.external_urls?.spotify
      },
      tracks: (data.tracks?.items || []).map((track) => ({ 
        id: track.id, 
        nombre: track.name, 
        artista: (track.artists || []).map(a => a.name).join(', '), 
        duracion: track.duration_ms, 
        preview: track.preview_url 
      }))
    });
  } catch (error) { 
    console.error(`ERROR en perfil álbum ${id}:`, error.message);
    return res.status(500).json({ status: 'error', mensaje: error.message }); 
  }
});

// PLAYLISTS (Top Mundial, Rankings...)
app.get(['/api/playlist/:id', '/api/music/playlist/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const token = await getSpotifyToken();
    const data = await fetchJsonWithRetry(`${SPOTIFY_API_BASE}/playlists/${id}`, { headers: { Authorization: `Bearer ${token}` } }, 1);
    res.json({
      status: 'ok',
      playlist: { 
        id: data.id, 
        nombre: data.name, 
        imagen: data.images?.[0]?.url, 
        descripcion: data.description, 
        creador: data.owner?.display_name,
        spotifyUrl: data.external_urls?.spotify
      },
      tracks: (data.tracks?.items || []).map(item => item.track ? ({ id: item.track.id, nombre: item.track.name, artista: item.track.artists[0]?.name, imagen: item.track.album?.images[0]?.url, preview: item.track.preview_url, duracion: item.track.duration_ms }) : null).filter(Boolean)
    });
  } catch (error) { 
    console.error(`ERROR en playlist ${id}:`, error.message);
    res.status(500).json({ status: 'error', mensaje: error.message }); 
  }
});

// Middleware de error global para evitar crashes del servidor
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]:', err.stack);
  res.status(500).json({ 
    status: 'error', 
    mensaje: 'Ha ocurrido un error inesperado en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`QUAVEMIND BFF corriendo en puerto ${PORT}`));
