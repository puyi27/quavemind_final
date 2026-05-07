# QUAVEMIND - Trabajo de Fin de Grado (TFG)
## Descripción Completa del Proyecto

---

## 🎯 ¿QUÉ ES QUAVEMIND?

**QUAVEMIND** es una **plataforma web enciclopédica y laboratorio de cultura urbana** especializada en **música latina y española**: Reggaetón, Trap Latino, Hip-Hop, R&B y Dembow.

Funciona como un **archivo confidencial y comunidad** donde los usuarios pueden:
- Descubrir artistas underdog y mainstream
- Analizar datos técnicos de canciones (BPM, energía, valencia)
- Explorar letras con anotaciones estilo Genius
- Aprender jerga urbana y slanguaje
- Jugar minijuegos musicales (Quavedle - versión Wordle de música)

---

## 👥 PÚBLICO OBJETIVO

- **Audiencia principal**: Jóvenes de 16-30 años amantes de la cultura urbana hispanohablante
- **Geografía**: España y Latinoamérica (México, Argentina, Colombia, Chile, Puerto Rico, etc.)
- **Nivel de conocimiento**: Desde descubridores de música hasta fans hardcore que quieren analizar métricas técnicas
- **Comunidad**: Usuarios que quieren contribuir con anotaciones, descubrimientos y jerga

---

## 🏗️ STACK TECNOLÓGICO

### Frontend
- **React.js 18** con Vite (build rápido)
- **React Router DOM v6** (navegación SPA)
- **Tailwind CSS** (estilos utilitarios)
- **react-icons** (iconos Material Design)

### Backend
- **Node.js** con Express.js
- **Prisma ORM** (interacción con PostgreSQL)
- **Neon** (PostgreSQL serverless en la nube)

### APIs Externas
- **Spotify Web API** (metadatos, portadas, previews, recomendaciones)
- **Deezer API** (previews de audio de 30 segundos)
- **Genius API** (letras de canciones con anotaciones)

### Estado y Almacenamiento
- **LocalStorage** (simula BD de usuarios: favoritos, valoraciones, estado de juegos)
- **PostgreSQL** (datos persistentes: artistas, canciones, anotaciones, logros)

---

## 🎨 DISEÑO UI/UX: NEOBRUTALISMO EDITORIAL

La interfaz simula una **terminal de datos confidencial y urbana**:

### Paleta de Colores
- **Fondo**: Negro puro (#000000) o gris oscuro (#0a0a0a)
- **Acento**: Naranja nuclear (#ff6b00) - el color "Quave"
- **Textos**: Blanco puro para títulos, grises para secundarios
- **Estado**: Verde (éxito), Rojo (errores), Amarillo (advertencias)

### Características Visuales
- **Bordes duros**: 2px-4px sin border-radius (cajas afiladas)
- **Sombras sólidas**: Sin blur, desplazamiento nítido (4px 4px 0px)
- **Tipografía**: 
  - Space Grotesk (títulos, negrita, mayúsculas)
  - JetBrains Mono (datos técnicos, métricas, código)
- **Interacciones**: Hover con cambio de color, transiciones rápidas (150ms-300ms)
- **Excepción**: Fotos de perfil de artistas sí son circulares (rounded-full)

---

## 📱 VISTAS Y FUNCIONALIDADES PRINCIPALES

### 1. 🏠 HOME / LANDING
**Objetivo**: Captar al usuario con diseño impactante y facilitar descubrimiento.

**Elementos**:
- Hero section con logo grande y animación sutil
- Buscador central con autocompletado en tiempo real
- "Artista del Día" destacado con foto grande y stats
- Grid de artistas destacados (6-12 tarjetas)
- Categorías: Trap, Reggaetón, Hip-Hop, Underground
- Call-to-action para usar el buscador completo

**Técnico**: Consume datos de PostgreSQL (artistas populares), fallback a Spotify si la BD está vacía.

---

### 2. 🔍 BUSCADOR (El Radar)
**Objetivo**: Busqueda unificada con resultados híbridos (local + Spotify).

**Funcionalidad**:
- **Búsqueda local**: Artistas, canciones y álbumes ya en la BD (rápido)
- **Búsqueda Spotify**: Millones de artistas en tiempo real
- **Importación automática**: Al hacer clic en un resultado de Spotify, se guarda en la BD para futuras búsquedas rápidas
- Filtros por tipo: Artistas, Canciones, Álbumes, Todo

**UX**: 
- Debounce de 300ms para no saturar
- Resultados en tiempo real mientras escribes
- Indicadores visuales de "Importando..." cuando se guarda un nuevo artista

---

### 3. 👤 PERFIL DE ARTISTA
**Objetivo**: Expediente completo del artista con datos técnicos y conexiones.

**Secciones**:
- **Header**: Foto grande, nombre verificado, géneros, stats (seguidores, popularidad)
- **Bio**: Información del artista
- **Discografía**: Álbumes y singles con portadas
- **Canciones populares**: Top tracks con BPM, energía, danceability
- **SongDNA**: Mapa de conexiones (featurings, artistas similares por género)
- **Análisis técnico**: Gráficos de audio features (radar chart)

**Datos**: Spotify para metadatos, almacenado en PostgreSQL para cache.

---

### 4. 🎵 PERFIL DE CANCIÓN (El Laboratorio)
**Objetivo**: Análisis profundo de una canción específica.

**Elementos**:
- **Reproductor**: Preview de 30s (Deezer/Spotify)
- **Stats técnicos**: BPM, Key, Energy, Danceability, Valence, Loudness
- **Letra**: Con anotaciones estilo Genius (usuarios pueden seleccionar texto y añadir explicaciones)
- **Rating**: Sistema de valoración 1-5 estrellas
- **Recomendaciones**: Canciones similares por audio features
- **Anotaciones**: Sistema de comentarios/contexto por versos

---

### 5. 📚 DICCIONARIO DE JERGA
**Objetivo**: Glosario colaborativo de términos urbanos.

**Funcionalidad**:
- Búsqueda en tiempo real
- Términos con definición, contexto de uso, origen geográfico
- Ejemplos en canciones reales (vinculados a la base de datos)
- Usuarios pueden proponer nuevos términos
- Tags: País de origen, género musical donde se usa más

**Ejemplo**: "Perreo" → Definición, origen Puerto Rico, ejemplo en canción de Daddy Yankee.

---

### 6. 🎮 QUAVEDLE (Minijuegos)
**Objetivo**: Juegos diarios tipo Wordle pero con música urbana.

**Modos de juego**:
1. **Álbum**: Adivinar el álbum por pistas (año, artista, tracklist)
2. **Songdle**: Adivinar la canción por lyrics o audio
3. **Portadas**: Adivinar el álbum por la portada pixelada
4. **Artista**: Adivinar el artista por pistas (género, popularidad, colaboradores)

**Modos de juego**:
- **Diario**: Una pista por día (compartir resultados)
- **Archivo**: Jugar días anteriores
- **Infinito**: Seed aleatorio, jugar ilimitado

**Progreso**: LocalStorage (rachas, estadísticas, logros desbloqueados).

---

### 7. 🗄️ BOVEDA (Colección Personal)
**Objetivo**: Espacio del usuario para guardar favoritos.

**Funcionalidad**:
- Guardar artistas, canciones, álbumes (LocalStorage)
- Listas personalizadas (ej. "Trap argentino 2023", "Para el gym")
- Historial de escucha/reproducción
- Estadísticas personales: Artistas más escuchados, géneros preferidos

---

### 8. 📝 SISTEMA DE ANOTACIONES (Estilo Genius)
**Objetivo**: Crowdsourcing de conocimiento sobre letras.

**Funcionalidad**:
- Seleccionar texto de una canción y añadir anotación
- Votar anotaciones (upvote/downvote)
- Sistema de moderación: Aprobadas, Pendientes, Destacadas
- Mencionar artistas en anotaciones (links automáticos)
- Puntos/karma para usuarios que contribuyen

---

## 🎭 FUNCIONALIDADES TRANSVERSALES

### Tema Oscuro/Claro
- Toggle en navbar
- Variables CSS que cambian toda la paleta
- Persistencia en LocalStorage

### Internacionalización (i18n)
- Soporte para Español e Inglés
- Detectar idioma del navegador
- Todas las labels traducibles

### Responsive Design
- Mobile-first (320px base)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Menú hamburguesa en móvil
- Grid adaptable según viewport

---

## 🏆 SISTEMA DE LOGROS Y GAMIFICACIÓN

Para incentivar el uso y la contribución:

- **"Primeras Palabras"**: Crear primera anotación
- **"Comentarista"**: 10 anotaciones creadas
- **"Maestro del Barrio"**: 50 anotaciones
- **"Adivino Novato"**: Ganar primer Quavedle
- **"Racha Perfecta"**: 5 Quavedles seguidos acertados
- **"Fiel"**: Jugar 7 días seguidos
- **"Curador"**: Importar 10 artistas nuevos al buscador

---

## 📊 DATOS Y MÉTRICAS TÉCNICAS

### Audio Features (de Spotify)
- **BPM (Tempo)**: Velocidad de la canción
- **Energy**: Intensidad y actividad (0-100)
- **Danceability**: Qué tan bailable es (0-100)
- **Valence**: Positividad/alegría (0-100)
- **Acousticness**: Qué tan acústica es
- **Instrumentalness**: Presencia de voces

### Popularidad
- **Índice Spotify**: 0-100 basado en reproducciones recientes
- **Popularidad en Quavemind**: Calculada por interacciones de usuarios

---

## 🚀 ROADMAP Y EVOLUCIÓN FUTURA

### Fase 1 (MVP - Actual)
- Buscador funcional con importación
- Perfiles de artistas básicos
- Quavedle funcional
- Diccionario de jerga

### Fase 2 (Próxima)
- Sistema de usuarios completo (login con JWT)
- Anotaciones colaborativas funcionando
- Playlist generator (basado en audio features)
- Recomendaciones personalizadas

### Fase 3 (Futuro)
- App móvil (React Native)
- Modo offline (descargar letras)
- Integración con TikTok/Instagram para trends
- Colaboraciones con artistas (perfiles verificados)

---

## 💡 INTENCIONES Y VALOR DEL PROYECTO

1. **Preservar cultura**: Documentar el under antes de que desaparezca o se vuelva mainstream
2. **Educar**: Enseñar métricas técnicas de música de forma accesible
3. **Comunidad**: Crear espacio donde fans puedan compartir conocimiento
4. **Descubrimiento**: Algoritmos que promuevan artistas under, no solo grandes sellos
5. **Diversidad**: Incluir escenas de todos los países hispanohablantes, no solo España/México/Argentina

---

## 🎓 RELEVANCIA COMO TFG

Este proyecto demuestra competencias en:
- **Full-stack development** (React + Node + PostgreSQL)
- **Integración de APIs** externas y manejo de rate limits
- **Diseño UI/UX** con identidad visual fuerte (neobrutalismo)
- **Arquitectura de software** (separación de concerns, hooks personalizados)
- **Base de datos relacional** (modelado, normalización, queries complejas)
- **Gamificación** y engagement de usuarios
- **Internacionalización** y accesibilidad web

---

**QUAVEMIND no es solo una app de música, es un archivo cultural vivo de la escena urbana hispanohablante.**