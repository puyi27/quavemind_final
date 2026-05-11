const ARTIST_TRUTH = {
  'espana': ['C. Tangana', 'Bad Gyal', 'Dellafuente', 'Quevedo', 'Saiko', 'Morad', 'Kidd Keo', 'Rels B', 'Omar Montes', 'Cruz Cafuné', 'Maikel Delacalle', 'Recycled J', 'Lola Indigo', 'Aitana', 'Yung Beef', 'JC Reyes', 'Abhir Hathi', 'Bb trickz', 'Judeline', 'La Zowi', 'Ptazeta', 'Lia Kali', 'Gloosito', 'Hoke', 'Hens', 'Ill Pekeño', 'Ergo Pro', 'Kase.O', 'Nach', 'SFDK', 'Mala Rodriguez', 'Ayax y Prok', 'Foyone', 'Hard GZ', 'Fernandocosta', 'Natos y Waor', 'Jarfaiter', 'ToteKing', 'Sho-Hai', 'Violadores del Verso', 'El Piezas', 'Rayden', 'Sharif', 'Rapsusklei', 'Falsalarma', 'CPV', '7 Notas 7 Colores', 'Hablando en Plata', 'Duo Kie', 'El Chojin', 'Rayden', 'ZPU', 'Ambkor'],
  'argentina': ['Duki', 'Bizarrap', 'Nicki Nicole', 'Trueno', 'Wos', 'Khea', 'Lit Killah', 'Tiago PZK', 'Rusherking', 'Maria Becerra', 'Emilia', 'Tini', 'Lali', 'Cazzu', 'Ysy A', 'Neo Pistea', 'Milo j', 'La Joaqui', 'Rei', 'Callejero Fino', 'BM', 'Luck Ra', 'Salastkbron', 'Alejo Isakk', 'Bhavi', 'Asan', 'Mesita', 'Yami Safdie', 'Taichu', 'Acru', 'Homer el Mero Mero', 'C.R.O'],
  'colombia': ['Karol G', 'Feid', 'J Balvin', 'Maluma', 'Shakira', 'Sebastian Yatra', 'Manuel Turizo', 'Camilo', 'Piso 21', 'Ryan Castro', 'Blessd', 'Beéle', 'Pirlo', 'Kapo', 'Soley', 'Esteban Rojas', 'DFZM', 'Nath', 'West Blanco', 'SOG', 'Akapellah', 'Nanpa Básico', 'Alcolirykoz', 'Crudo Means Raw'],
  'mexico': ['Peso Pluma', 'Natanael Cano', 'Junior H', 'Fuerza Regida', 'Eslabon Armado', 'Gabito Ballesteros', 'Oscar Maydon', 'Grupo Frontera', 'Carín León', 'Santa Fe Klan', 'Christian Nodal', 'Banda MS', 'Xavi', 'Tito Double P', 'Chino Pacas', 'Yahritza y su Esencia', 'Yng Lvcas', 'El Bogueto', 'Dani Flow', 'Bellakath', 'Yeri Mua', 'Kenia OS', 'Cartel de Santa', 'Gera MX', 'Alemán', 'Control Machete', 'Dharius'],
  'puertorico': ['Bad Bunny', 'Anuel AA', 'Ozuna', 'Myke Towers', 'Arcangel', 'Wisin', 'Yandel', 'Jhayco', 'Rauw Alejandro', 'Lunay', 'Daddy Yankee', 'Don Omar', 'Nicky Jam', 'De La Ghetto', 'Zion', 'Lennox', 'Farruko', 'Eladio Carrion', 'Mora', 'Young Miko', 'Luar La L', 'Yovngchimi', 'Omar Courtz', 'Dei V', 'Bryant Myers', 'Alvaro Diaz', 'Residente', 'Calle 13', 'Tego Calderon', 'Ivy Queen', 'Vico C'],
  'chile': ['Cris MJ', 'Polima Westcoast', 'Paloma Mami', 'Marcianeke', 'AK4:20', 'Young Cister', 'Pablo Chill-E', 'Pailita', 'Jere Klein', 'Jordan 23', 'Gino Mella', 'Jairo Vera', 'Standly', 'Julianno Sosa', 'FloyyMenor', 'King Savagge', 'Akriila', 'Ana Tijoux', 'Movimiento Original', 'Portavoz', 'Tiro de Gracia'],
  'venezuela': ['Canserbero', 'Lil Supa', 'Apache', 'Akapellah', 'Neutro Shorty', 'Micro TDH', 'Big Soto', 'Trainer', 'Rawayana'],
  'republicadominicana': ['El Alfa', 'Rochy RD', 'Chimbala', 'Bulin 47', 'El Mayor Clasico', 'Mozart La Para', 'Natti Natasha', 'Romeo Santos', 'Prince Royce', 'Tokischa', 'Yailin La Mas Viral', 'La Insuperable', 'Amenazzy', 'Kiko El Crazy', 'Cherry Scom', 'Angel Dior', 'Flow 28']
};

const GENRE_MAP = {
  'trap': ['trap argentino', 'trap espanol', 'latin trap', 'trap', 'dark trap'],
  'reggaeton': ['reggaeton', 'reggaeton colombiano', 'reggaeton flow', 'urbano latino'],
  'rkt': ['rkt', 'cumbia villera', 'turreo'],
  'corridos': ['corridos tumbados', 'sierreno', 'corridos'],
  'hiphop': ['hip hop', 'rap', 'rap espanol', 'hip hop espanol', 'rap latino', 'hip hop latino', 'boombap']
};

export const validateArtist = (artist, context = {}) => {
  const name = artist.nombre || artist.name;
  let detectedScene = null;

  for (const [scene, artists] of Object.entries(ARTIST_TRUTH)) {
    if (artists.some(a => name.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(name.toLowerCase()))) {
      detectedScene = scene;
      break;
    }
  }

  // Si no se detecta por nombre, intentar por género
  if (!detectedScene && artist.generos) {
    for (const [genreKey, keywords] of Object.entries(GENRE_MAP)) {
      if (artist.generos.some(g => keywords.some(k => g.toLowerCase().includes(k)))) {
        // Mapeo simple de género a escena si no hay nada mejor
        if (genreKey === 'hiphop') detectedScene = 'hispano';
        break;
      }
    }
  }

  if (context.scene && detectedScene && context.scene !== detectedScene) return null;
  if (context.scene && !detectedScene) {
    const isRelated = artist.generos?.some(g => g.toLowerCase().includes(context.scene.toLowerCase()));
    if (!isRelated) return null;
  }

  return {
    ...artist,
    escena: detectedScene || (artist.generos?.[0]?.includes('argentine') ? 'argentina' : null),
    validado: !!detectedScene
  };
};

export const normalizeArtistList = (artists, context = {}) => {
  return artists
    .map(a => validateArtist(a, context))
    .filter(Boolean);
};

