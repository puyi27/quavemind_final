<p align="center">

  <br>
  <strong>QUAVEMIND</strong>
</p>

<p align="center">
  <strong>Plataforma Inteligente de Descubrimiento y Gamificación de Música Urbana</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

---

## 🚀 Sobre el Proyecto

**QUAVEMIND** es un ecosistema digital diseñado para los entusiastas de la música urbana (Hip-Hop, Trap, Reggaetón y R&B). No es solo un buscador de música; es una plataforma que combina el descubrimiento inteligente mediante algoritmos personalizados con una experiencia de juego interactiva y social.

Este proyecto ha sido desarrollado como **Trabajo de Fin de Grado (TFG)** para el ciclo de **Desarrollo de Aplicaciones Web (2º DAW)**, enfocándose en la escalabilidad, la experiencia de usuario (UX) premium y la optimización de rendimiento en aplicaciones Full-Stack.

## ✨ Características Principales

### 🎮 Quavedle & Verso Oculto
Experiencias de juego diarias inspiradas en Wordle pero adaptadas al mundo musical. Desafía tus conocimientos sobre artistas, álbumes y letras de canciones.
- **Quavedle**: Adivina el artista/canción con pistas progresivas.
- **Verso Oculto**: Identifica el tema a partir de fragmentos de letras analizados por la API de Genius.

### 📡 Radar de Descubrimiento
Algoritmo de recomendación que analiza tendencias y gustos del usuario para ofrecer sugerencias diarias personalizadas, integrando datos en tiempo real de la API de Spotify.

### 🏛️ The Vault (La Bóveda)
Tu espacio personal donde puedes gestionar tu biblioteca, ver estadísticas detalladas de escucha y guardar tus descubrimientos más preciados.

### 🔍 Generador Inteligente
Herramienta de creación de playlists y perfiles de canciones basada en géneros, estados de ánimo y jerga técnica del género urbano.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18 con Vite para un bundling ultrarrápido.
- **Estado**: Zustand (Gestión ligera y eficiente del estado global).
- **Data Fetching**: React Query (@tanstack/react-query) para caching y sincronización de datos.
- **Estilos**: Tailwind CSS con un sistema de diseño personalizado.
- **Animaciones**: Framer Motion para una interfaz fluida y viva.

### Backend
- **Runtime**: Node.js con Express 5.
- **ORM**: Prisma para una gestión de base de datos segura y tipada.
- **Base de Datos**: PostgreSQL para persistencia de datos.
- **Cache**: Redis para optimizar las peticiones repetitivas a APIs externas.
- **Seguridad**: Autenticación JWT y encriptación de contraseñas con Bcrypt.

### Integraciones de Terceros
- **Spotify API**: Datos de artistas, álbumes y reproducción.
- **Genius API**: Obtención y análisis de letras de canciones.

---

## ⚡ Rendimiento y Optimización

- **Prefetching**: Implementación de precarga de datos al hacer hover en elementos clave mediante React Query.
- **Caching Estratégico**: Uso de Redis en el backend para minimizar la latencia en la comunicación con APIs externas y optimizar el uso de cuotas.
- **Imágenes Optimizadas**: Carga dinámica de variantes de imágenes según el tamaño del contenedor para reducir el consumo de ancho de banda.

---

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/quavemind.git
   cd quavemind
   ```

2. **Configuración del Backend:**
   ```bash
   cd backend
   npm install
   # Crea un archivo .env basado en .env.example y añade tus credenciales (DB, Spotify, Genius)
   npx prisma migrate dev
   npm run seed:datos # Opcional: Cargar datos iniciales
   npm start
   ```

3. **Configuración del Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">Desarrollado con ❤️ por Angel - TFG 2º DAW</p>
