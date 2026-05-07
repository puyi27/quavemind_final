const ARTIST_TRUTH = {
  'espana': ['C. Tangana', 'Bad Gyal', 'Dellafuente', 'Quevedo', 'Saiko', 'Morad', 'Kidd Keo', 'Rels B', 'Omar Montes', 'Cruz Cafuné', 'Maikel Delacalle', 'Recycled J', 'Lola Indigo', 'Aitana', 'Yung Beef', 'JC Reyes', 'Abhir Hathi', 'Bb trickz', 'Judeline', 'La Zowi', 'Ptazeta', 'Lia Kali', 'Gloosito', 'Hoke', 'Hens', 'Ill Pekeño', 'Ergo Pro'],
  'argentina': ['Duki', 'Bizarrap', 'Nicki Nicole', 'Trueno', 'Wos', 'Khea', 'Lit Killah', 'Tiago PZK', 'Rusherking', 'Maria Becerra', 'Emilia', 'Tini', 'Lali', 'Cazzu', 'Ysy A', 'Neo Pistea', 'Milo j', 'La Joaqui', 'Rei', 'Callejero Fino', 'BM', 'Luck Ra', 'Salastkbron', 'Alejo Isakk', 'Bhavi', 'Asan', 'Mesita', 'Yami Safdie', 'Taichu'],
  'colombia': ['Karol G', 'Feid', 'J Balvin', 'Maluma', 'Shakira', 'Sebastian Yatra', 'Manuel Turizo', 'Camilo', 'Piso 21', 'Ryan Castro', 'Blessd', 'Beéle', 'Pirlo', 'Kapo', 'Soley', 'Esteban Rojas', 'DFZM', 'Nath', 'West Blanco', 'SOG'],
  'mexico': ['Peso Pluma', 'Natanael Cano', 'Junior H', 'Fuerza Regida', 'Eslabon Armado', 'Gabito Ballesteros', 'Oscar Maydon', 'Grupo Frontera', 'Carín León', 'Santa Fe Klan', 'Christian Nodal', 'Banda MS', 'Xavi', 'Tito Double P', 'Chino Pacas', 'Yahritza y su Esencia', 'Yng Lvcas', 'El Bogueto', 'Dani Flow', 'Bellakath', 'Yeri Mua', 'Kenia OS'],
  'puertorico': ['Bad Bunny', 'Anuel AA', 'Ozuna', 'Myke Towers', 'Arcangel', 'Wisin', 'Yandel', 'Jhayco', 'Rauw Alejandro', 'Lunay', 'Daddy Yankee', 'Don Omar', 'Nicky Jam', 'De La Ghetto', 'Zion', 'Lennox', 'Farruko', 'Eladio Carrion', 'Mora', 'Young Miko', 'Luar La L', 'Yovngchimi', 'Omar Courtz', 'Dei V', 'Bryant Myers', 'Alvaro Diaz'],
  'chile': ['Cris MJ', 'Polima Westcoast', 'Paloma Mami', 'Marcianeke', 'AK4:20', 'Young Cister', 'Pablo Chill-E', 'Pailita', 'Jere Klein', 'Jordan 23', 'Gino Mella', 'Jairo Vera', 'Standly', 'Julianno Sosa', 'FloyyMenor', 'King Savagge'],
  'republicadominicana': ['El Alfa', 'Rochy RD', 'Chimbala', 'Bulin 47', 'El Mayor Clasico', 'Mozart La Para', 'Natti Natasha', 'Romeo Santos', 'Prince Royce', 'Tokischa', 'Yailin La Mas Viral', 'La Insuperable', 'Amenazzy', 'Kiko El Crazy', 'Cherry Scom', 'Angel Dior', 'Flow 28']
};

const GENRE_MAP = {
  'trap': ['trap argentino', 'trap espanol', 'latin trap', 'trap'],
  'reggaeton': ['reggaeton', 'reggaeton colombiano', 'reggaeton flow'],
  'rkt': ['rkt', 'cumbia villera'],
  'corridos': ['corridos tumbados', 'sierreno', 'corridos']
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
