/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Tipos centrales del dominio
 * ────────────────────────────────────────────────────────────────
 */

/** Las cuatro categorías apilables de una pieza de sushi. */
export type Category = "base" | "protein" | "sauce" | "topping";

/** Paleta de colores de un ingrediente (usada por el motor SVG). */
export interface Palette {
  /** Color principal (también se usa como punto indicador en el ticket). */
  main: string;
  /** Tono claro para brillos y vetas. */
  light: string;
  /** Tono oscuro para sombras y contornos. */
  dark: string;
  /** Acento opcional (veta del salmón, sésamo del arroz negro, …). */
  accent?: string;
}

/** Definición inmutable de un ingrediente del bar. */
export interface IngredientDef {
  id: string;
  category: Category;
  /** Nombre completo y evocador. */
  name: string;
  /** Nombre corto para fichas compactas. */
  short: string;
  /** Micro-descripción ASMR para la ficha. */
  blurb: string;
  palette: Palette;
}

/** Pedido activo: lista ordenada de ids de ingredientes (capas). */
export interface Order {
  /** Nº de ticket (#1, #2, …). */
  seq: number;
  /** Capas exactas a replicar en el plato. */
  layers: string[];
  /** Nivel de dificultad con el que se generó (0..4). */
  tier: number;
  /** Nombre simpático del cliente que espera. */
  customer: string;
}

/** Resultado de comparar el plato con el ticket. */
export interface ValidationResult {
  ok: boolean;
  /** Ingredientes que faltan (id repetido según cantidad faltante). */
  missing: string[];
  /** Ingredientes que sobran en el plato. */
  extra: string[];
}

/** Pantallas principales del flujo. */
export type ScreenId = "start" | "playing" | "over";

/**
 * Modos de juego:
 *  · rush → partida de 90 s contra el reloj, combos y récord.
 *  · zen  → sin reloj: un sushi por nivel, a tu ritmo, para
 *           relajarte. Los fallos no castigan, solo susurran.
 */
export type GameMode = "rush" | "zen";

/** Perfil de dispositivo para proporciones de la mesa. */
export type DeviceKind = "mobile" | "tablet" | "desktop";

/** Estados de ánimo de la mascota itamae. */
export type Mood = "idle" | "happy" | "worried" | "celebrate";

/** Retroalimentación tras SERVIR. */
export interface Feedback {
  kind: "success" | "fail";
  message: string;
  key: number;
}

/** Ganancia del último pedido perfecto (para el popup de yenes). */
export interface Gain {
  gained: number;
  multiplier: number;
  key: number;
}
