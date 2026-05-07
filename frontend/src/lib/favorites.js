export const readFavorites = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('quave_favs'));

    return {
      canciones: Array.isArray(parsed?.canciones) ? parsed.canciones : [],
      artistas: Array.isArray(parsed?.artistas) ? parsed.artistas : [],
      albumes: Array.isArray(parsed?.albumes) ? parsed.albumes : [],
    };
  } catch {
    return { canciones: [], artistas: [], albumes: [] };
  }
};

export const writeFavorites = (favorites) => {
  const normalized = {
    canciones: Array.isArray(favorites?.canciones) ? favorites.canciones : [],
    artistas: Array.isArray(favorites?.artistas) ? favorites.artistas : [],
    albumes: Array.isArray(favorites?.albumes) ? favorites.albumes : [],
  };

  localStorage.setItem('quave_favs', JSON.stringify(normalized));
};
