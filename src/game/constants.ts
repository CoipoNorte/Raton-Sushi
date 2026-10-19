/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Constantes de equilibrio (game balance)
 *  Ajusta aquí la dificultad, los tiempos y la puntuación.
 * ────────────────────────────────────────────────────────────────
 */

import type { LevelDef } from "./types";

/** Duración inicial de la ronda, en segundos. */
export const ROUND_SECONDS = 90;

/** Segundos extra que regala cada pedido perfecto. */
export const TIME_BONUS_SECONDS = 4;

/** Techo del cronómetro para que no crezca sin control. */
export const TIME_CAP_SECONDS = 99;

/** Umbral de pánico: la barra de tiempo se vuelve roja. */
export const LOW_TIME_SECONDS = 10;

/** Paso del multiplicador por acierto encadenado. */
export const COMBO_STEP = 0.5;

/** Multiplicador máximo alcanzable (×2.5). */
export const COMBO_CAP = 2.5;

/** Puntos base de un pedido estándar (base + proteína + topping). */
export const BASE_POINTS = 60;

/** Puntos extra por cada capa por encima del trío estándar. */
export const LAYER_BONUS_POINTS = 18;

/** El multiplicador redondea el resultado a múltiplos de 10 yenes. */
export const POINTS_ROUNDING = 10;

/** Máximo de capas por categoría en el plato de trabajo. */
export const CATEGORY_CAPS = {
  base: 1,
  protein: 2,
  sauce: 2,
  topping: 3,
} as const;

/** Nº de servidos a partir del cual sube la dificultad (tier). */
export const TIER_THRESHOLDS = [0, 3, 6, 10, 14] as const;

/** Probabilidad de topping duplicado (×2) en el tier máximo. */
export const DUP_TOPPING_CHANCE = 0.45;

/* ─── Modo ZEN (sin reloj, un sushi por nivel) ───────────────── */

/** Yenes de propina por nivel zen completado. */
export const ZEN_LEVEL_POINTS = 50;

/** Cada cuántos niveles zen sube un tier de complejidad. */
export const ZEN_LEVELS_PER_TIER = 3;

/** Títulos honoríficos que vas ganando en zen. */
export const ZEN_TITLES = [
  "Aprendiz de arroz",
  "Ayudante de barra",
  "Cortador novato",
  "Itamae en prácticas",
  "Maestro del nigiri",
  "Leyenda del kaiten",
] as const;

/* ─── Modo PEDIDOS (8 niveles con meta y cronómetro) ─────────── */

/**
 * Escalera de dificultad suave: sube el número de pedidos y el
 * tier de los tickets, mientras el tiempo se mantiene ajustado
 * pero justo. Pensada para completarse en una sentada y volver
 * a por las 3 estrellas.
 */
export const LEVELS: readonly LevelDef[] = [
  { id: 1, name: "Primer turno", goal: 3, seconds: 75, tier: 0 },
  { id: 2, name: "Clientes del mediodía", goal: 4, seconds: 75, tier: 0 },
  { id: 3, name: "Hora punta", goal: 4, seconds: 70, tier: 1 },
  { id: 4, name: "Doble ración", goal: 5, seconds: 75, tier: 1 },
  { id: 5, name: "Salsas cruzadas", goal: 5, seconds: 70, tier: 2 },
  { id: 6, name: "Mesa grande", goal: 6, seconds: 75, tier: 2 },
  { id: 7, name: "Noche de estreno", goal: 6, seconds: 70, tier: 3 },
  { id: 8, name: "Gran banquete", goal: 7, seconds: 80, tier: 4 },
] as const;

/** Yenes extra al superar un nivel (propina del maestro). */
export const LEVEL_CLEAR_BONUS = 120;

/** Umbrales de tiempo restante (en %) para 3 y 2 estrellas. */
export const STAR_THRESHOLDS = { three: 0.4, two: 0.15 } as const;

/** Nombres de clientes del kaiten (cozy · kawaii). */
export const CUSTOMER_NAMES = [
  "Sra. Kiki",
  "Sr. Mochi",
  "Tía Ume",
  "Don Toro",
  "Nia Komugi",
  "Sr. Bento",
  "Ama Sora",
  "Pez Bonito",
  "Sr. Taro",
  "Lulu Goma",
] as const;
