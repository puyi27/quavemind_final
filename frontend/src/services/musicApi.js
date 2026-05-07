import fetchOptimizer from '../utils/fetchOptimizer';

// Función utilitaria para dividir array en chunks
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Servicio para obtener artistas en bulk con chunking
export const fetchArtistasBulk = async (nombresArray, chunkSize = 10) => {
  if (!nombresArray || nombresArray.length === 0) {
    return { success: true, artistas: [] };
  }

  const chunks = chunkArray(nombresArray, chunkSize);
  const resultados = [];

  const promesas = chunks.map(async (chunk) => {
    // El optimizador ya maneja el catch y el fallback
    const data = await fetchOptimizer.get('/music/artistas/bulk', { 
      nombres: chunk.join(',') 
    });
    
    if (data?.status === 'ok' && Array.isArray(data.artistas)) {
      return { success: true, artistas: data.artistas };
    }
    return { success: false, artistas: [] };
  });

  const settled = await Promise.allSettled(promesas);

  settled.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      resultados.push(...result.value.artistas);
    }
  });

  return { 
    success: resultados.length > 0, 
    artistas: resultados.filter(a => a && a.id) 
  };
};

// Servicio de búsqueda con fallback
export const buscarMusica = async (query, tipo = 'artist', limit = 20) => {
  const data = await fetchOptimizer.get('/music/buscar', {
    q: query, 
    tipo, 
    limit
  });

  if (data) {
    return { 
      success: true, 
      resultados: data.resultados || { artistas: [], canciones: [], albumes: [] } 
    };
  }

  return { 
    success: false, 
    resultados: { artistas: [], canciones: [], albumes: [] } 
  };
};

// Servicio para obtener tracks de artista
export const fetchTracksArtista = async (nombreArtista, limit = 4) => {
  const data = await fetchOptimizer.get('/music/buscar', {
    q: nombreArtista,
    tipo: 'track',
    limit
  });

  return { 
    success: !!data, 
    tracks: data?.resultados?.canciones || [] 
  };
};

// Servicio para obtener álbumes de artista
export const fetchAlbumesArtista = async (nombreArtista, limit = 3) => {
  const data = await fetchOptimizer.get('/music/buscar', {
    q: nombreArtista,
    tipo: 'album',
    limit
  });

  return { 
    success: !!data, 
    albumes: data?.resultados?.albumes || [] 
  };
};

// Servicio para obtener artistas por IDs con chunking
export const fetchArtistasByIds = async (idsArray, chunkSize = 10) => {
  if (!idsArray || idsArray.length === 0) {
    return { success: true, artistas: [] };
  }

  const chunks = chunkArray(idsArray, chunkSize);
  const resultados = [];

  const promesas = chunks.map(async (chunk) => {
    const data = await fetchOptimizer.get('/music/artistas', {
      ids: chunk.join(','),
      scrape: 'true'
    });
    
    if (data?.status === 'ok' && Array.isArray(data.artistas)) {
      return { success: true, artistas: data.artistas };
    }
    return { success: false, artistas: [] };
  });

  const settled = await Promise.allSettled(promesas);

  settled.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      resultados.push(...result.value.artistas);
    }
  });

  return { 
    success: resultados.length > 0, 
    artistas: resultados.filter(a => a && a.id) 
  };
};

// Servicio para obtener stats reales con chunking
export const fetchArtistasStatsBulk = async (artistasData, chunkSize = 10) => {
  if (!artistasData || artistasData.length === 0) {
    return { success: true, artistas: [] };
  }

  const chunks = chunkArray(artistasData, chunkSize);
  const resultados = [];

  const promesas = chunks.map(async (chunk) => {
    const data = await fetchOptimizer.post('/music/artists-real-stats/bulk', {
      artistas: chunk
    });
    
    if (data?.status === 'ok' && Array.isArray(data.data)) {
      return { success: true, artistas: data.data };
    }
    return { success: false, artistas: [] };
  });

  const settled = await Promise.allSettled(promesas);

  settled.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      resultados.push(...result.value.artistas);
    }
  });

  return { 
    success: resultados.length > 0, 
    artistas: resultados 
  };
};