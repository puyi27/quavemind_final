export const readRatings = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('quave_ratings'));
    const normalizeBucket = (bucket) => {
      if (!bucket || typeof bucket !== 'object') {
        return {};
      }

      return Object.fromEntries(
        Object.entries(bucket).map(([id, entry]) => {
          if (typeof entry === 'number') {
            return [
              id,
              {
                value: entry,
                updatedAt: null,
                snapshot: null,
              },
            ];
          }

          return [
            id,
            {
              value: typeof entry?.value === 'number' ? entry.value : 0,
              updatedAt: entry?.updatedAt || null,
              snapshot: entry?.snapshot || null,
            },
          ];
        })
      );
    };

    return {
      canciones: normalizeBucket(parsed?.canciones),
      albumes: normalizeBucket(parsed?.albumes),
    };
  } catch {
    return { canciones: {}, albumes: {} };
  }
};

export const writeRatings = (ratings) => {
  const normalized = {
    canciones: ratings?.canciones && typeof ratings.canciones === 'object' ? ratings.canciones : {},
    albumes: ratings?.albumes && typeof ratings.albumes === 'object' ? ratings.albumes : {},
  };

  localStorage.setItem('quave_ratings', JSON.stringify(normalized));
};

export const getRating = (type, id) => {
  const ratings = readRatings();
  return ratings[type]?.[id]?.value || 0;
};

export const setRating = (type, id, value, snapshot = null) => {
  const ratings = readRatings();
  ratings[type] = {
    ...(ratings[type] || {}),
    [id]: {
      value,
      updatedAt: new Date().toISOString(),
      snapshot,
    },
  };
  writeRatings(ratings);
};

export const listRatings = (type) => {
  const ratings = readRatings();

  return Object.entries(ratings[type] || {})
    .map(([id, entry]) => ({
      id,
      value: entry?.value || 0,
      updatedAt: entry?.updatedAt || null,
      snapshot: entry?.snapshot || null,
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

      if (dateB !== dateA) {
        return dateB - dateA;
      }

      return b.value - a.value;
    });
};
