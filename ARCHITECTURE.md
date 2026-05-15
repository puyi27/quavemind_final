# 🏗️ Arquitectura del Proyecto - QUAVEMIND

Este documento detalla la estructura y el flujo de datos de la aplicación QUAVEMIND, diseñada bajo principios de modularidad y escalabilidad para un entorno Full-Stack moderno.

## 📂 Estructura de Directorios

### 🌐 Frontend (`/frontend`)
Desarrollado con **React** y **Vite**, centrado en la eficiencia y la interactividad.
- `src/components`: Componentes reutilizables (Botones, Modales, Tarjetas de artista).
- `src/pages`: Vistas principales de la aplicación (Home, Login, Perfil, Quavedle).
- `src/data`: Datos estáticos y configuraciones (Géneros, constantes).
- `src/store`: Gestión de estado global utilizando **Zustand**.
- `src/hooks`: Hooks personalizados para lógica compartida y llamadas a API.

### ⚙️ Backend (`/backend`)
Servidor robusto basado en **Express 5** con arquitectura de capas.
- `index.js`: Punto de entrada y configuración de middlewares globales.
- `routes/`: Definición de los endpoints de la API (Auth, Music, Games).
- `middleware/`: Lógica de validación de tokens JWT y control de errores.
- `lib/` / `utils/`: Utilidades para comunicación con Genius y Spotify.
- `scripts/`: Herramientas de automatización para el seeding de la base de datos.

### 🗄️ Base de Datos (`/prisma`)
- `schema.prisma`: Definición del modelo de datos unificado.
- Migraciones gestionadas para asegurar la integridad referencial.

---

## 🔄 Flujo de Datos

1. **Autenticación**: El usuario se registra/loga mediante JWT. El token se almacena de forma segura para autorizar peticiones posteriores.
2. **Descubrimiento**: El frontend solicita recomendaciones. El backend verifica en **Redis** si existen datos cacheados; si no, consulta a la API de **Spotify** y guarda el resultado antes de responder.
3. **Gamificación**: Para juegos como *Quavedle*, el backend sirve datos de canciones/artistas pre-validados en la base de datos, asegurando que el juego siempre tenga contenido disponible.
4. **Persistencia**: Toda acción del usuario (guardar canciones en 'The Vault', progresos en juegos) se sincroniza con **PostgreSQL** a través de **Prisma**.

---

## 🚀 Decisiones Técnicas Clave

- **React Query**: Implementado para evitar peticiones redundantes. Si un usuario vuelve a una página visitada, los datos se sirven instantáneamente desde la caché local.
- **Express 5**: Aprovechamiento de las mejoras nativas en el manejo de promesas y errores asíncronos.
- **Redis Integration**: Crucial para manejar el tráfico y no exceder los límites de velocidad (rate-limits) de las APIs de Spotify y Genius.
- **Tailwind + Framer Motion**: Combinación elegida para lograr una estética "Dark Mode" premium con micro-interacciones que mejoran el engagement.

---
<p align="center">TFG - Desarrollo de Aplicaciones Web</p>
