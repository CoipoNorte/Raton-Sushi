/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Hook-máquina de estados de la partida
 *
 *  Dos modos conviviendo en la misma máquina:
 *   · RUSH → 90 s, combo creciente, bonificación de tiempo y
 *            récord histórico en yenes.
 *   · ZEN  → sin reloj: un sushi por nivel, sin castigo al fallar,
 *            complejidad que sube cada pocos niveles y progreso
 *            persistente. Pensado para respirar hondo.
 * ────────────────────────────────────────────────────────────────
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CATEGORY_CAPS,
  LOW_TIME_SECONDS,
  ROUND_SECONDS,
  TIER_THRESHOLDS,
  TIME_BONUS_SECONDS,
  TIME_CAP_SECONDS,
  ZEN_LEVELS_PER_TIER,
  ZEN_LEVEL_POINTS,
  ZEN_TITLES,
} from "../game/constants";
import {
  categoryOf,
  correctionHint,
  generateOrder,
  multiplierFor,
  pointsFor,
  validatePlate,
} from "../game/logic";
import { sfx } from "../game/sound";
import { storage } from "../game/storage";
import type { Feedback, Gain, GameMode, Order, ScreenId } from "../game/types";

/** Micro-vibración táctil defensiva (no existe en todos lados). */
function buzz(pattern: number | number[]): void {
  try {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
}

/** Nivel zen → "served" equivalente, para reutilizar los tiers. */
function zenServedFor(level: number): number {
  const step = Math.floor((level - 1) / ZEN_LEVELS_PER_TIER);
  const tierIdx = Math.min(step, TIER_THRESHOLDS.length - 1);
  return TIER_THRESHOLDS[tierIdx];
}

/** Título honorífico según el nivel zen alcanzado. */
export function zenTitleFor(level: number): string {
  const idx = Math.min(Math.floor((level - 1) / ZEN_LEVELS_PER_TIER), ZEN_TITLES.length - 1);
  return ZEN_TITLES[idx];
}

export interface SushiGame {
  screen: ScreenId;
  mode: GameMode;
  startGame: (mode: GameMode) => void;
  goHome: () => void;
  endRound: () => void;

  timeLeft: number;
  score: number;
  served: number;
  streak: number;
  bestCombo: number;
  multiplier: number;

  /** Nivel actual en modo zen (1..∞). */
  zenLevel: number;
  /** Mejor nivel zen alcanzado jamás. */
  bestZenLevel: number;
  /** Celebración breve al superar un nivel zen. */
  levelUp: number | null;

  plate: string[];
  popIndex: number;
  order: Order;

  feedback: Feedback | null;
  gain: Gain | null;
  flight: string[] | null;
  confettiKey: number;
  shakeKey: number;
  moodFlash: "happy" | "sad" | null;

  bestScore: number;
  isRecord: boolean;

  muted: boolean;
  toggleMute: () => void;

  /** Partida en pausa (menú de ajustes abierto). */
  paused: boolean;
  togglePause: () => void;
  resume: () => void;

  /** Saltar de pestaña al completar una sección del ticket. */
  autoAdvance: boolean;
  toggleAutoAdvance: () => void;

  addIngredient: (id: string) => void;
  undo: () => void;
  clearPlate: () => void;
  serve: () => void;
}

export function useSushiGame(): SushiGame {
  const [screen, setScreen] = useState<ScreenId>("start");
  const [mode, setMode] = useState<GameMode>("rush");
  const [muted, setMutedState] = useState<boolean>(() => storage.getMuted());
  const [paused, setPaused] = useState(false);
  const [autoAdvance, setAutoAdvanceState] = useState<boolean>(() => storage.getAutoAdvance());

  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [served, setServed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestCombo, setBestCombo] = useState(1);

  const [zenLevel, setZenLevel] = useState(1);
  const [bestZenLevel, setBestZenLevel] = useState<number>(() => storage.getZenLevel());
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const [plate, setPlate] = useState<string[]>([]);
  const [popIndex, setPopIndex] = useState(-1);
  const [order, setOrder] = useState<Order>(() => generateOrder(0, 1));

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [gain, setGain] = useState<Gain | null>(null);
  const [flight, setFlight] = useState<string[] | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [moodFlash, setMoodFlash] = useState<"happy" | "sad" | null>(null);

  const [bestScore, setBestScore] = useState<number>(() => storage.getBestScore());
  const [isRecord, setIsRecord] = useState(false);

  const closingRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  /* ─── Cronómetro: solo en rush y con la partida en marcha ───── */
  useEffect(() => {
    if (screen !== "playing" || mode !== "rush" || paused) return;
    const iv = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, +(prev - 0.1).toFixed(2));
        if (next > 0 && next <= LOW_TIME_SECONDS && Math.ceil(next) !== Math.ceil(prev)) {
          sfx.tick();
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(iv);
  }, [screen, mode, paused]);

  /* ─── Fin de ronda (rush) ───────────────────────────────────── */
  useEffect(() => {
    if (screen !== "playing" || mode !== "rush" || timeLeft > 0 || closingRef.current) return;
    closingRef.current = true;
    setScreen("over");
    setFlight(null);
    setMoodFlash(null);
    const final = score;
    if (final > storage.getBestScore()) {
      storage.setBestScore(final);
      setBestScore(final);
      setIsRecord(true);
      sfx.record();
    } else {
      sfx.closing();
    }
  }, [screen, mode, timeLeft, score]);

  /* ─── Flujo ─────────────────────────────────────────────────── */
  const startGame = useCallback((nextMode: GameMode) => {
    sfx.unlock();
    sfx.click();
    closingRef.current = false;
    setPaused(false);
    setMode(nextMode);
    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    setServed(0);
    setStreak(0);
    setBestCombo(1);
    setZenLevel(1);
    setLevelUp(null);
    setPlate([]);
    setPopIndex(-1);
    setOrder(generateOrder(nextMode === "zen" ? zenServedFor(1) : 0, 1));
    setFeedback(null);
    setGain(null);
    setFlight(null);
    setMoodFlash(null);
    setIsRecord(false);
    setScreen("playing");
  }, []);

  const goHome = useCallback(() => {
    sfx.click();
    closingRef.current = false;
    setPaused(false);
    setScreen("start");
  }, []);

  /** Salir de zen (o rendirse en rush) mostrando el resumen. */
  const endRound = useCallback(() => {
    sfx.click();
    setPaused(false);
    if (mode === "zen") {
      setScreen("start");
      return;
    }
    setTimeLeft(0);
  }, [mode]);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      storage.setMuted(next);
      sfx.setMuted(next);
      if (!next) {
        sfx.unlock();
        sfx.click();
      }
      return next;
    });
  }, []);

  /** Pausa: congela el reloj y abre el menú de ajustes. */
  const togglePause = useCallback(() => {
    sfx.click();
    setPaused((p) => !p);
  }, []);
  const resume = useCallback(() => {
    sfx.click();
    setPaused(false);
  }, []);

  /** Preferencia de auto-avance de pestañas (persistida). */
  const toggleAutoAdvance = useCallback(() => {
    setAutoAdvanceState((prev) => {
      const next = !prev;
      storage.setAutoAdvance(next);
      sfx.click();
      return next;
    });
  }, []);

  /* ─── Construcción de la pieza ──────────────────────────────── */
  const addIngredient = useCallback(
    (id: string) => {
      if (screen !== "playing") return;
      const cat = categoryOf(id);
      if (!cat) return;

      setPlate((prev) => {
        if (cat === "base") {
          const rest = prev.filter((x) => categoryOf(x) !== "base");
          const next = [...rest, id];
          setPopIndex(next.length - 1);
          return next;
        }
        const inCat = prev.filter((x) => categoryOf(x) === cat);
        if (inCat.length >= CATEGORY_CAPS[cat]) return prev;
        const next = [...prev, id];
        setPopIndex(next.length - 1);
        return next;
      });

      if (cat === "sauce") sfx.sizzle();
      else sfx.place();
      buzz(8);
    },
    [screen]
  );

  const undo = useCallback(() => {
    if (screen !== "playing") return;
    setPlate((prev) => prev.slice(0, -1));
    setPopIndex(-1);
    sfx.click();
  }, [screen]);

  const clearPlate = useCallback(() => {
    if (screen !== "playing") return;
    setPlate((prev) => {
      if (prev.length === 0) return prev;
      sfx.click();
      return [];
    });
    setPopIndex(-1);
  }, [screen]);

  /* ─── SERVIR ────────────────────────────────────────────────── */
  const serve = useCallback(() => {
    if (screen !== "playing" || plate.length === 0) return;
    const result = validatePlate(plate, order.layers);
    const key = Date.now();

    if (result.ok) {
      if (mode === "zen") {
        /* ── ZEN: subir de nivel, sin reloj ni presión ────────── */
        const nextLevel = zenLevel + 1;
        setScore((s) => s + ZEN_LEVEL_POINTS);
        setServed((v) => v + 1);
        setZenLevel(nextLevel);
        setLevelUp(zenLevel);
        setGain({ gained: ZEN_LEVEL_POINTS, multiplier: 1, key });
        setFeedback({ kind: "success", message: `¡Nivel ${zenLevel} completado!`, key });
        if (nextLevel > storage.getZenLevel()) {
          storage.setZenLevel(nextLevel);
          setBestZenLevel(nextLevel);
        }
        setOrder(generateOrder(zenServedFor(nextLevel), order.seq + 1));
        later(1500, () => setLevelUp(null));
      } else {
        /* ── RUSH: combo, yenes y segundos extra ─────────────── */
        const newStreak = streak + 1;
        const mult = multiplierFor(newStreak);
        const gained = pointsFor(order, mult);
        setScore((s) => s + gained);
        setServed((v) => v + 1);
        setStreak(newStreak);
        setBestCombo((b) => Math.max(b, newStreak));
        setTimeLeft((t) => Math.min(TIME_CAP_SECONDS, t + TIME_BONUS_SECONDS));
        setGain({ gained, multiplier: mult, key });
        setFeedback({ kind: "success", message: `+${gained}¥  ¡Itadakimasu!`, key });
        setOrder(generateOrder(served + 1, order.seq + 1));
        sfx.success(newStreak);
      }

      setFlight(plate);
      setPlate([]);
      setConfettiKey((k) => k + 1);
      setMoodFlash("happy");
      sfx.cut();
      if (mode === "zen") sfx.success(2);
      buzz([10, 40, 14]);
      later(950, () => setFlight(null));
      later(1400, () => setMoodFlash(null));
      later(1700, () => setFeedback((f) => (f && f.key === key ? null : f)));
    } else {
      /* ── Fallo: en zen no castiga, solo susurra la corrección ─ */
      if (mode === "rush") setStreak(0);
      setFeedback({
        kind: "fail",
        message: mode === "zen" ? `${correctionHint(result)}` : `${correctionHint(result)} · se rompe el combo`,
        key,
      });
      setShakeKey((k) => k + 1);
      setMoodFlash("sad");
      sfx.fail();
      buzz(mode === "zen" ? 30 : 90);
      later(1300, () => setMoodFlash(null));
      later(1900, () => setFeedback((f) => (f && f.key === key ? null : f)));
    }
    setPopIndex(-1);
  }, [screen, mode, plate, order, streak, served, zenLevel, later]);

  return {
    screen,
    mode,
    startGame,
    goHome,
    endRound,
    timeLeft,
    score,
    served,
    streak,
    bestCombo,
    multiplier: multiplierFor(Math.max(1, streak)),
    zenLevel,
    bestZenLevel,
    levelUp,
    plate,
    popIndex,
    order,
    feedback,
    gain,
    flight,
    confettiKey,
    shakeKey,
    moodFlash,
    bestScore,
    isRecord,
    muted,
    toggleMute,
    paused,
    togglePause,
    resume,
    autoAdvance,
    toggleAutoAdvance,
    addIngredient,
    undo,
    clearPlate,
    serve,
  };
}
