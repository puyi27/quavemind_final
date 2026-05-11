// DATOS CURADOS POR GÉNERO - Artistas verificados para cada estilo
// Esto garantiza que cuando entres a un género, veas realmente ese estilo

export const GENEROS_DATA = {
  'trap-latino': {
    nombre: 'TRAP LATINO',
    color: 'from-purple-700 via-purple-600 to-pink-600',
    descripcion: 'Beats oscuros, 808s potentes y letras crudas de la calle',
    origen: 'Atlanta → Latinoamérica',
    bpm: '130-170',
    instrumentos: ['808s', 'Hi-hats', 'Snare rolls', 'Synths oscuros'],
    subgeneros: ['Trap argentino', 'Trap español', 'Drill latino', 'Cloud rap'],
    artistas: {
      establecidos: [
        'Duki', 'Bad Bunny', 'Cazzu', 'Khea', 'Ysy A', 'Dellafuente', 
        'Kidd Keo', 'Neo Pistea', 'Paulo Londra', 'L-Gante', 'Trueno',
        'Wos', 'Lit Killah', 'Tiago PZK', 'Maria Becerra', 'Emilia'
      ],
      // NUEVOS TALENTOS: Artistas con <3 años de carrera, <500K seguidores, sin hits globales
      emergentes: [
        'Obie Wanshot', 'Milo j', 'Nicki Nicole', 'Morad', 'Maka',
        'Pekeñoo', 'Crumble', 'Tommy Lee', 'Yesan', 'Agorazein',
        'Alizzz', 'Bejo', 'Marc Segui', 'Arkano', 'Sule B',
        'Gloosito', 'Zack Tabudlo', 'Aitch', 'Natos y Waor', 'Foyone'
      ]
    },
    playlistsSpotify: ['Trap Latino', 'Modo Trap', 'Trap Kings', 'Latin Drill'],
    caracteristicas: ['Letras de calle', 'Flow variable', 'Autotune', 'Producción pesada']
  },

  'reggaeton': {
    nombre: 'REGGAETÓN',
    color: 'from-[#ff6b00] via-orange-500 to-red-500',
    descripcion: 'El dembow que mueve al mundo desde Puerto Rico',
    origen: 'Puerto Rico, 1990s',
    bpm: '90-110',
    instrumentos: ['Dembow', 'Kick', 'Snare', 'Synth leads'],
    subgeneros: ['Reggaeton clásico', 'Dembow', 'Moombahton', 'Perreo'],
    artistas: {
      establecidos: [
        'Daddy Yankee', 'Bad Bunny', 'Karol G', 'Feid', 'Ozuna', 
        'Anuel AA', 'J Balvin', 'Maluma', 'Wisin y Yandel', 'Don Omar',
        'Tego Calderón', 'Ivy Queen', 'Nicky Jam', 'Zion y Lennox',
        'Arcangel', 'De La Ghetto', 'Plan B', 'Alexis y Fido',
        'Jowell y Randy', 'Farruko', 'Arcángel', 'Lenny Tavárez', 'Sech'
      ],
      emergentes: [
        'Yan Block', 'Yeison Jiménez', 'Pirlo', 'Panita', 'Bebo Yau',
        'Nsqk', 'Andreina', 'Villano Antillano', 'Camilo', 'Rauw Alejandro',
        'Mora', 'Quevedo', 'Feid', 'Meli', 'Samy', 'W Sound'
      ]
    },
    playlistsSpotify: ['Perreo Intenso', 'Reggaeton 2024', 'Clásicos del Perreo'],
    caracteristicas: ['Dembow', 'Perreo', 'Pista bailable', 'Letra explícita']
  },

  'rnb-latino': {
    nombre: 'R&B LATINO',
    color: 'from-indigo-600 via-purple-500 to-pink-500',
    descripcion: 'Vibes suaves, sensuales y románticas',
    origen: 'USA → Latinoamérica',
    bpm: '60-90',
    instrumentos: ['Vocales suaves', 'Piano', 'Guitarra', '808s suaves'],
    subgeneros: ['R&B tradicional', 'Alternative R&B', 'Bedroom pop', 'Neo soul'],
    artistas: {
      establecidos: [
        'Rauw Alejandro', 'Sebastian Yatra', 'CNCO', 'Camilo', 
        'Mau y Ricky', 'Lunay', 'Manuel Turizo', 'Myke Towers',
        'Jay Wheeler', 'Danny Ocean', 'Greeicy', 'Mike Bahía'
      ],
      emergentes: [
        'Milo j', 'Mora', 'Quevedo', 'Saiko', 'Ptazeta',
        'Lola Indigo', 'Aitana', 'Lunay', 'Danny Ocean', 'Sebastian Yatra'
      ]
    },
    playlistsSpotify: ['R&B Latino', 'Noches de R&B', 'Romántico', 'Slow Jams'],
    caracteristicas: ['Vocales melódicas', 'Letras románticas', 'Producción suave', 'Feelings']
  },

  'hiphop-rap': {
    nombre: 'HIP-HOP / RAP',
    color: 'from-gray-800 via-gray-700 to-black',
    descripcion: 'Cultura urbana en estado puro. MCs y rimas',
    origen: 'Bronx, New York, 1970s',
    bpm: '85-110',
    instrumentos: ['Samples', 'Breakbeats', 'Bass', 'Scratches'],
    subgeneros: ['Boom bap', 'Conscious rap', 'Hardcore', 'Jazz rap'],
    artistas: {
      establecidos: [
        'Nach', 'Kase.O', 'Wos', 'Residente', 'Calle 13',
        'Foyone', 'SFDK', 'Toteking', 'Shotta', 'Elphomega',
        'Rapsusklei', 'Kultama', 'Gata Cattana', 'Bejo', 'Soto Asa',
        'Canserbero', 'Lil Supa', 'Akapellah', 'Apache', 'Acru',
        'CPV', '7 Notas 7 Colores', 'Hablando en Plata', 'Duo Kie', 'Control Machete'
      ],
      emergentes: [
        'Recycled J', 'Cruz Cafuné', 'Juancho Marqués', 'Kaze',
        'Nikone', 'Hoke', 'Hens', 'Abhir', 'Alee', 'Aron'
      ]
    },
    playlistsSpotify: ['Rap Español', 'Old School', 'Freestyle', 'Rimadores'],
    caracteristicas: ['Rimas complejas', 'Conciencia social', 'Freestyle', 'Samples']
  },

  'corridos-tumbados': {
    nombre: 'CORRIDOS TUMBADOS',
    color: 'from-amber-600 via-yellow-500 to-orange-600',
    descripcion: 'Sierreño urbano y narcocultura moderna',
    origen: 'Sinaloa/Sonora, México',
    bpm: '120-140',
    instrumentos: ['Tuba', 'Guitarra sierreña', 'Requinto', 'Batería'],
    subgeneros: ['Corridos tumbados', 'Sierreño', 'Norteño', 'Banda'],
    artistas: {
      establecidos: [
        'Peso Pluma', 'Natanael Cano', 'Junior H', 'Fuerza Regida',
        'Eslabon Armado', 'Gabito Ballesteros', 'Oscar Maydon',
        'DannyLux', 'Eden Muñoz', 'El Fantasma', 'Luis R Conriquez',
        'Carín León', 'Grupo Frontera', 'Banda MS', 'Calibre 50'
      ],
      emergentes: [
        'Tito Double P', 'Chino Pacas', 'Mariachi Peralta', 'Yahritza y su Esencia',
        'Ivan Cornejo', 'Kevin Kaarl', 'Marca MP', 'Ovi', 'Panchito Arredondo',
        'Santa Fe Klan', 'T3R Elemento', 'Ulices Chaidez', 'Legado 7'
      ]
    },
    playlistsSpotify: ['Corridos Tumbados', 'Sierreño 2024', 'Puros Corridos'],
    caracteristicas: ['Tuba', 'Guitarra sierreña', 'Narcocorridos', 'Mexicano']
  },

  'dembow': {
    nombre: 'DEMBOW',
    color: 'from-green-600 via-emerald-500 to-teal-600',
    descripcion: 'Ritmo perreo intenso desde el under',
    origen: 'Panamá/Jamaica → Latinoamérica',
    bpm: '90-100',
    instrumentos: ['Dembow rhythm', 'Kick pesado', 'Snare', 'Voces procesadas'],
    subgeneros: ['Dembow puro', 'Dembow pop', 'Rkt', 'Cachengue'],
    artistas: {
      establecidos: [
        'El Alfa', 'CJ', 'Chimbala', 'Bulin 47', 'Rochy RD',
        'El Mayor Clasico', 'Mozart La Para', 'Black Point',
        'Quimico Ultra Mega', 'Sensato', 'Farruko', 'Arcangel'
      ],
      emergentes: [
        'Tokischa', 'Yailin La Mas Viral', 'La Insuperable', 'Nino Freestyle',
        'Chucky73', 'Fetti Fuego', 'Haraca Kiko', 'Amara La Negra'
      ]
    },
    playlistsSpotify: ['Dembow Pesado', 'Perreo Under', 'Dembow 2024', 'Calle'],
    caracteristicas: ['Ritmo dembow', 'BPM alto', 'Underground', 'Perreo intenso']
  },

  'pop-urbano': {
    nombre: 'POP URBANO',
    color: 'from-pink-500 via-rose-500 to-red-500',
    descripcion: 'Canciones pegadizas con sello urbano',
    origen: 'Global',
    bpm: '100-120',
    instrumentos: ['Beats bailables', 'Synths', 'Hooks pegajosos'],
    subgeneros: ['Pop latino', 'Urban pop', 'Dance pop', 'Electropop'],
    artistas: {
      establecidos: [
        'Maluma', 'Sebastian Yatra', 'Luis Fonsi', 'Becky G',
        'Danna Paola', 'Tini', 'Lali', 'Aitana', 'Lola Indigo',
        'Anitta', 'Pabllo Vittar', 'Gloria Estefan'
      ],
      emergentes: [
        'Belén Aguilera', 'Vicco', 'Samuraï', 'Pol Granch',
        'Nil Moliner', 'Antonio José', 'Samantha Hudson', 'Ptazeta'
      ]
    },
    playlistsSpotify: ['Pop Urbano', 'Hits Latino', 'Radio Hits'],
    caracteristicas: ['Catchy', 'Radio-friendly', 'Bailable', 'Crossover']
  },

  'electronica-latina': {
    nombre: 'ELECTRÓNICA LATINA',
    color: 'from-cyan-500 via-blue-500 to-indigo-600',
    descripcion: 'House, techno y fusiones latinas',
    origen: 'Europa → Latinoamérica',
    bpm: '120-130',
    instrumentos: ['Synthesizers', 'Drum machines', 'Samples latinos'],
    subgeneros: ['House latino', 'Tribal', 'Moombahton', 'Deep house'],
    artistas: {
      establecidos: [
        'DJ Snake', 'Major Lazer', 'Bomba Estéreo', 'Matisse',
        'Deorro', 'Nervo', 'Steve Aoki', 'Diplo', 'Skrillex',
        'Alok', 'Vintage Culture', 'Artbat'
      ],
      emergentes: [
        'Bizarrap', 'Ovy On The Drums', 'Tainy', 'Sky Rompiendo',
        'Foreign Teck', 'Esto es Eso', 'Funk Tomorrow'
      ]
    },
    playlistsSpotify: ['Electrónica Latina', 'House Latino', 'Festival Latino'],
    caracteristicas: ['Beats electrónicos', 'Fusiones', 'Festival', 'Euphoria']
  },

  'latin-alternative': {
    nombre: 'LATIN ALTERNATIVE',
    color: 'from-lime-500 via-green-500 to-emerald-600',
    descripcion: 'Indie, rock y experimentación fuera de normas',
    origen: 'Latinoamérica',
    bpm: 'Variable',
    instrumentos: ['Guitarra', 'Batería', 'Bajo', 'Teclados'],
    subgeneros: ['Rock latino', 'Indie', 'Post-punk', 'New wave'],
    artistas: {
      establecidos: [
        'Cafe Tacvba', 'Zoe', 'Mon Laferte', 'Morat',
        'Los Enanitos Verdes', 'Soda Stereo', 'Los Prisioneros',
        'Calle 13', 'Babasónicos', 'Aterciopelados', 'Los Fabulosos Cadillacs'
      ],
      emergentes: [
        'The Marias', 'Cuco', 'Inner Wave', 'Clairo',
        'Girl Ultra', 'Natalia Lafourcade', 'Ximena Sariñana'
      ]
    },
    playlistsSpotify: ['Latin Alternative', 'Indie Latino', 'Rock en Español'],
    caracteristicas: ['Indie', 'Experimental', 'Rock', 'Underground']
  },

  'cumbia-urbana': {
    nombre: 'CUMBIA URBANA',
    color: 'from-violet-600 via-purple-600 to-fuchsia-600',
    descripcion: 'Folclore modernizado con beats',
    origen: 'Colombia → Latinoamérica',
    bpm: '90-110',
    instrumentos: ['Guacharaca', 'Accordion', 'Percusión', 'Bass moderno'],
    subgeneros: ['Cumbia rebajada', 'Cumbia villera', 'Cumbia digital'],
    artistas: {
      establecidos: [
        'Los Angeles Azules', 'Damas Gratis', 'Celso Piña', 
        'Lia Crucet', 'El Original', 'La Sonora Dinamita',
        'Rodrigo', 'Grupo Niche', 'Joe Arroyo'
      ],
      emergentes: [
        'El Gitano', 'Antonio Rios', 'Pablo Lescano', 'La Yegros',
        'Frikstailers', 'Chancha Via Circuito', 'Dengue Dengue Dengue'
      ]
    },
    playlistsSpotify: ['Cumbia Urbana', 'Cumbia Rebajada', 'Cumbia Para Bailar'],
    caracteristicas: ['Guacharaca', 'Folclore', 'Tribal', 'Bailable']
  },

  'dancehall-latino': {
    nombre: 'DANCEHALL',
    color: 'from-yellow-400 via-amber-500 to-orange-500',
    descripcion: 'Ritmos jamaiquinos con sabor latino',
    origen: 'Jamaica → Latinoamérica',
    bpm: '90-110',
    instrumentos: ['Dembow', 'Riddims', 'Bass', 'Brass'],
    subgeneros: ['Dancehall español', 'Reggae', 'Dembow', 'Ragga'],
    artistas: {
      establecidos: [
        'Don Omar', 'Wisin', 'Yandel', 'Sean Paul', 'Shaggy',
        'Toño Rosario', 'Zion', 'Lennox', 'Zion y Lennox',
        'J Balvin', 'Nicky Jam'
      ],
      emergentes: [
        'Charly Black', 'Konshens', 'Spice', 'Popcaan',
        'Dexta Daps', 'Masicka', 'Intence', 'Jada Kingdom'
      ]
    },
    playlistsSpotify: ['Dancehall Latino', 'Caribbean Vibes', 'Puro Dancehall'],
    caracteristicas: ['Patois', 'Riddims', 'Caribeño', 'Energético']
  },

  'afrobeat-latino': {
    nombre: 'AFROBEAT LATINO',
    color: 'from-amber-700 via-yellow-600 to-amber-500',
    descripcion: 'Fusión africana con ritmos latinos',
    origen: 'África Occidental → Latinoamérica',
    bpm: '100-120',
    instrumentos: ['Percusión africana', 'Guitarra', 'Brass', 'Beats'],
    subgeneros: ['Afrobeat', 'Afro-fusion', 'Afro-pop', 'Latin Afrobeat'],
    artistas: {
      establecidos: [
        'Burna Boy', 'Wizkid', 'Davido', 'Rema', 'Tems',
        'Fireboy DML', 'Omah Lay', 'CKay', 'Ayra Starr',
        'J Balvin', 'Maluma', 'Ozuna'
      ],
      emergentes: [
        'Libianca', 'Joeboy', 'Ruger', 'Asake', 'Buju BNXN',
        'Johnny Drille', 'Ladipoe', 'Bloody Civilian'
      ]
    },
    playlistsSpotify: ['Afrobeat Latino', 'Afro-Latin Vibes', 'Groove Africano'],
    caracteristicas: ['Percusión africana', 'Funky', 'Groovy', 'Fusión']
  }
};

// Función para obtener artistas de un género
export const getArtistasPorGenero = (generoId, tipo = 'todos') => {
  const genero = GENEROS_DATA[generoId];
  if (!genero) return [];
  
  if (tipo === 'establecidos') return genero.artistas.establecidos;
  if (tipo === 'emergentes') return genero.artistas.emergentes;
  return [...genero.artistas.establecidos, ...genero.artistas.emergentes];
};

// Función para buscar artistas de múltiples géneros (para Quavedle)
export const getArtistasAleatorios = (cantidad = 10) => {
  const todosArtistas = [];
  Object.values(GENEROS_DATA).forEach(genero => {
    todosArtistas.push(...genero.artistas.establecidos);
  });
  
  // Mezclar y retornar cantidad solicitada
  const mezclado = todosArtistas.sort(() => 0.5 - Math.random());
  return mezclado.slice(0, cantidad);
};