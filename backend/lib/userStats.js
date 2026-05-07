import prisma from '../db.js';

/**
 * Añade puntos a un usuario y registra el motivo en el historial.
 * @param {string} usuarioId - ID del usuario.
 * @param {number} puntos - Cantidad de puntos a añadir.
 * @param {string} motivo - Descripción del motivo (ej. 'quavedle_win', 'valoracion_post').
 * @returns {Promise<object>} - El usuario actualizado.
 */
export async function añadirQuavePoints(usuarioId, puntos, motivo) {
  if (!usuarioId || puntos <= 0) return null;

  try {
    // Realizamos la operación en una transacción para asegurar consistencia
    const [usuarioActualizado, registroHistorial] = await prisma.$transaction([
      // 1. Actualizar el total del usuario
      prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          quavePoints: {
            increment: puntos
          }
        }
      }),
      // 2. Crear el registro en el historial
      prisma.historialPuntos.create({
        data: {
          usuarioId,
          puntos,
          motivo
        }
      })
    ]);

    console.log(`[USER_STATS] ${puntos} puntos añadidos a ${usuarioId} por ${motivo}`);
    return usuarioActualizado;
  } catch (error) {
    console.error('[USER_STATS] Error al añadir puntos:', error);
    throw error;
  }
}

/**
 * Registra el resultado de una partida de juego.
 * @param {string} usuarioId - ID del usuario.
 * @param {string} juego - Nombre del juego ('quavedle', 'versoOculto', etc.).
 * @param {number} puntuacion - Puntuación obtenida.
 * @param {object} metadatos - Datos adicionales de la partida.
 */
export async function registrarResultadoJuego(usuarioId, juego, puntuacion, metadatos = {}) {
  if (!usuarioId) return null;

  try {
    return await prisma.resultadoJuego.create({
      data: {
        usuarioId,
        juego,
        puntuacion,
        metadatos
      }
    });
  } catch (error) {
    console.error('[USER_STATS] Error al registrar resultado de juego:', error);
    throw error;
  }
}
