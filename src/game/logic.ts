/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Lógica pura del juego
 *  Generación de pedidos, validación exacta por categoría,
 *  multiplicador de combo y puntuación. Sin efectos secundarios
 *  (salvo Math.random en la generación de pedidos).
 * ────────────────────────────────────────────────────────────────
 */
import {
  BASE_POINTS,
  CATEGORY_CAPS,
  COMBO_CAP,
  COMBO_STEP,
  CUSTOMER_NAMES,
  DUP_TOPPING_CHANCE,
  LAYER_BONUS_POINTS,
  POINTS_ROUNDING,
  TIER_THRESHOLDS,
} from "./constants";
import { INGREDIENTS_BY_CATEGORY, INGREDIENTS_BY_ID } from "./ingredients";
import type { Category, IngredientDef, Order, ValidationResult } from "./types";

/* ─── RNG determinista (para que ticket y plato dibujen igual) ── */

/** Hash FNV-1a de una cadena → semilla uint32. */
export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: PRNG pequeño y determinista. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** RNG determinista con nombre (p. ej. "salmon:0"). */
export function rngFor(key: string): () => number {
  return mulberry32(hashString(key));
}

/* ─── Dificultad progresiva ───────────────────────────────────── */

/** Tier de dificultad según pedidos ya servidos (0..4). */
export function tierFor(served: number): number {
  let tier = 0;
  for (let i = 0; i < TIER_THRESHOLDS.length; i++) {
    if (served >= TIER_THRESHOLDS[i]) tier = i;
  }
  return tier;
}

/** Elige `n` elementos distintos de una lista. */
function sampleDistinct<T>(list: readonly T[], n: number): T[] {
  const pool = [...list];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function pickOne<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Genera el siguiente pedido. La complejidad sube con `served`:
 *  t0 base+1p+1t · t1 +salsa · t2 1-2p+salsa+1t
 *  t3 2p+1-2s+1-2t · t4 2p+2s cruzadas+2t (con ×2 frecuente).
 */
export function generateOrder(served: number, seq: number): Order {
  const tier = tierFor(served);
  const bases = INGREDIENTS_BY_CATEGORY.base;
  const proteins = INGREDIENTS_BY_CATEGORY.protein;
  const sauces = INGREDIENTS_BY_CATEGORY.sauce;
  const toppings = INGREDIENTS_BY_CATEGORY.topping;

  const layers: string[] = [];
  layers.push(pickOne(bases).id); // base siempre única

  // Proteínas: 1 al principio, hasta 2 (máximo de plato) después.
  const wantProteins = tier >= 3 ? 2 : tier >= 2 ? (Math.random() < 0.55 ? 2 : 1) : 1;
  layers.push(...sampleDistinct(proteins, Math.min(wantProteins, CATEGORY_CAPS.protein)).map((p: IngredientDef) => p.id));

  // Salsas: 0 → 1 → 2 (cruzadas) según tier.
  const wantSauces = tier >= 4 ? 2 : tier >= 1 ? (tier >= 3 ? (Math.random() < 0.5 ? 2 : 1) : 1) : 0;
  layers.push(...sampleDistinct(sauces, Math.min(wantSauces, CATEGORY_CAPS.sauce)).map((s) => s.id));

  // Toppings: 1 → 2, con duplicados ×2 en los últimos niveles.
  if (tier >= 3 && Math.random() < DUP_TOPPING_CHANCE + (tier >= 4 ? 0.25 : 0)) {
    // Topping repetido ×2 (o 1 único + 1 distinto)
    const dup = pickOne(toppings).id;
    layers.push(dup, dup);
    if (Math.random() < 0.4) {
      const extra = sampleDistinct(toppings.filter((t) => t.id !== dup), 1)[0].id;
      layers.push(extra);
    }
  } else {
    const wantToppings = tier >= 4 ? 2 : tier >= 3 ? (Math.random() < 0.5 ? 2 : 1) : 1;
    layers.push(...sampleDistinct(toppings, Math.min(wantToppings, CATEGORY_CAPS.topping)).map((t) => t.id));
  }

  return {
    seq,
    layers,
    tier,
    customer: pickOne(CUSTOMER_NAMES),
  };
}

/* ─── Validación exacta (multiconjunto por categoría) ─────────── */

function idCounts(layers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const id of layers) map.set(id, (map.get(id) ?? 0) + 1);
  return map;
}

/**
 * Compara plato vs ticket. Es estricta: por cada ingrediente la
 * cantidad debe coincidir exactamente (soporta topping ×2).
 * El orden de colocación no importa: es un juego relajante.
 */
export function validatePlate(plate: string[], target: string[]): ValidationResult {
  const have = idCounts(plate);
  const want = idCounts(target);
  const missing: string[] = [];
  const extra: string[] = [];

  for (const [id, w] of want) {
    const h = have.get(id) ?? 0;
    for (let i = h; i < w; i++) missing.push(id);
  }
  for (const [id, h] of have) {
    const w = want.get(id) ?? 0;
    for (let i = w; i < h; i++) extra.push(id);
  }
  return { ok: missing.length === 0 && extra.length === 0, missing, extra };
}

/** Mensaje amable para corregir el plato tras fallar. */
export function correctionHint(result: ValidationResult): string {
  const name = (id: string) => INGREDIENTS_BY_ID.get(id)?.short ?? id;
  if (result.missing.length > 0) return `Falta: ${name(result.missing[0])}`;
  if (result.extra.length > 0) return `Sobra: ${name(result.extra[0])}`;
  return "Revisa el ticket con calma";
}

/* ─── Puntuación y combo ──────────────────────────────────────── */

/** Multiplicador actual según racha de aciertos (×1 → ×2.5). */
export function multiplierFor(streak: number): number {
  return Math.min(1 + COMBO_STEP * Math.max(0, streak - 1), COMBO_CAP);
}

/** Yenes que otorga un pedido perfecto (capas extra valen más). */
export function pointsFor(order: Order, multiplier: number): number {
  const layers = order.layers.length;
  const raw = (BASE_POINTS + LAYER_BONUS_POINTS * Math.max(0, layers - 3)) * multiplier;
  return Math.round(raw / POINTS_ROUNDING) * POINTS_ROUNDING;
}

/** Categoría de un id (seguridad tipada con fallback). */
export function categoryOf(id: string): Category | null {
  return INGREDIENTS_BY_ID.get(id)?.category ?? null;
}

/* ─── Progreso por categoría (para el auto-avance de pestañas) ── */

/** Cuántas capas de una categoría hay en una lista de ids. */
export function countInCategory(ids: string[], cat: Category): number {
  return ids.reduce((n, id) => (categoryOf(id) === cat ? n + 1 : n), 0);
}

/**
 * ¿El plato ya cubre lo que el ticket pide de esa categoría?
 * Exige coincidencia exacta de ingredientes y cantidades, así el
 * salto de pestaña solo ocurre cuando la sección está REALMENTE
 * terminada (ni de menos ni de más).
 */
export function isCategoryComplete(plate: string[], target: string[], cat: Category): boolean {
  const pick = (ids: string[]) => ids.filter((id) => categoryOf(id) === cat);
  const have = idCounts(pick(plate));
  const want = idCounts(pick(target));
  if (have.size !== want.size) return false;
  for (const [id, w] of want) {
    if ((have.get(id) ?? 0) !== w) return false;
  }
  return true;
}

/**
 * Siguiente categoría pendiente tras completar `from`, recorriendo
 * el orden natural de montaje de forma circular. Devuelve null si
 * ya está todo listo (momento de pulsar SERVIR).
 */
export function nextPendingCategory(
  plate: string[],
  target: string[],
  from: Category
): Category | null {
  const order: Category[] = ["base", "protein", "sauce", "topping"];
  const start = order.indexOf(from);
  for (let step = 1; step <= order.length; step++) {
    const cat = order[(start + step) % order.length];
    // Solo saltamos a categorías que el ticket realmente usa
    const needed = target.some((id) => categoryOf(id) === cat);
    if (needed && !isCategoryComplete(plate, target, cat)) return cat;
  }
  return null;
}
