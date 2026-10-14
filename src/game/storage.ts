/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Persistencia (récord + preferencia de sonido)
 *
 *  Módulo autocontenido y defensivo:
 *   · Detecta localStorage inaccesible (modo incógnito, iframes
 *     sandboxed, navegadores con cookies bloqueadas) y degrada a
 *     una memoria volátil para que el juego jamás se rompa.
 *   · Toda la app habla con esta interfaz mínima (get/set JSON con
 *     esquema versionado), así migrar a IndexedDB en el futuro solo
 *     implica reimplementar este archivo, sin tocar el juego.
 * ────────────────────────────────────────────────────────────────
 */

const PREFIX = "raton-sushi:v1:";
const KEY_BEST = `${PREFIX}best-score`;
const KEY_MUTED = `${PREFIX}muted`;
const KEY_ZEN = `${PREFIX}zen-level`;
const KEY_AUTO = `${PREFIX}auto-advance`;

/** Driver de respaldo en memoria (incógnito / errores de cuota). */
class MemoryDriver {
  private map = new Map<string, string>();
  get(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  set(key: string, value: string): void {
    this.map.set(key, value);
  }
}

/** Driver localStorage probado en caliente (algunas APIs mienten). */
class LocalStorageDriver {
  private fallback = new MemoryDriver();
  private available: boolean;
  constructor() {
    this.available = this.probe();
  }
  private probe(): boolean {
    try {
      const k = `${PREFIX}probe`;
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false; // incógnito, quota excedida, acceso denegado…
    }
  }
  get(key: string): string | null {
    if (!this.available) return this.fallback.get(key);
    try {
      return window.localStorage.getItem(key);
    } catch {
      return this.fallback.get(key);
    }
  }
  set(key: string, value: string): void {
    if (!this.available) {
      this.fallback.set(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, value);
      this.fallback.set(key, value); // espejo por seguridad
    } catch {
      this.fallback.set(key, value);
    }
  }
}

/** Interfaz única exportada; futura migración async → IndexedDB aquí. */
class GameStorage {
  private driver = new LocalStorageDriver();

  private readNumber(key: string, def: number): number {
    const raw = this.driver.get(key);
    if (raw === null) return def;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : def;
  }

  /** Mejor puntuación histórica (yenes). */
  getBestScore(): number {
    return this.readNumber(KEY_BEST, 0);
  }
  setBestScore(score: number): void {
    this.driver.set(KEY_BEST, String(Math.max(0, Math.floor(score))));
  }

  /** Preferencia persistente de silencio. */
  getMuted(): boolean {
    return this.driver.get(KEY_MUTED) === "1";
  }
  setMuted(muted: boolean): void {
    this.driver.set(KEY_MUTED, muted ? "1" : "0");
  }

  /** Nivel más alto alcanzado en modo zen (mínimo 1). */
  getZenLevel(): number {
    return Math.max(1, this.readNumber(KEY_ZEN, 1));
  }
  setZenLevel(level: number): void {
    this.driver.set(KEY_ZEN, String(Math.max(1, Math.floor(level))));
  }

  /**
   * Auto-avance de pestaña: al completar lo que el ticket pide de
   * una categoría, saltar sola a la siguiente pendiente.
   * Viene ACTIVADO por defecto (ausencia de valor = activado).
   */
  getAutoAdvance(): boolean {
    return this.driver.get(KEY_AUTO) !== "0";
  }
  setAutoAdvance(on: boolean): void {
    this.driver.set(KEY_AUTO, on ? "1" : "0");
  }
}

export const storage = new GameStorage();
