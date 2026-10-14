/**
 * Pantalla de inicio: el ratoncito itamae te recibe y eliges
 * cómo quieres cocinar hoy.
 *  · RUSH → 90 s contra el reloj, combos y récord en yenes.
 *  · ZEN  → un sushi por nivel, sin reloj, para relajarte.
 * Muestra el récord y el mejor nivel zen, ambos persistidos.
 */
import { motion } from "framer-motion";
import { Leaf, Play, Timer, Trophy, Volume2, VolumeX } from "lucide-react";
import { MouseChef } from "../components/MouseChef";
import { SushiRenderer } from "../components/sushi/SushiRenderer";
import type { GameMode } from "../game/types";
import { zenTitleFor } from "../hooks/useSushiGame";

interface StartScreenProps {
  bestScore: number;
  bestZenLevel: number;
  muted: boolean;
  onToggleMute: () => void;
  onStart: (mode: GameMode) => void;
}

const SAMPLE_PLATE = ["shari", "salmon", "sriracha", "tobiko"];

export function StartScreen({ bestScore, bestZenLevel, muted, onToggleMute, onStart }: StartScreenProps) {
  return (
    <motion.div
      className="relative z-10 flex h-dvh overflow-y-auto p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <div className="m-auto flex w-full max-w-[400px] flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/55 p-4 shadow-[0_20px_50px_rgba(140,100,60,0.22)] backdrop-blur-md sm:p-5">
        {/* Cabecera con mascota y pieza de ejemplo viva */}
        <div className="relative flex items-end justify-center">
          <MouseChef mood="idle" size={118} />
          <motion.div
            className="absolute -right-16 bottom-2 w-[104px]"
            animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <SushiRenderer layers={SAMPLE_PLATE} className="h-auto w-full drop-shadow-[0_8px_10px_rgba(120,85,50,0.3)]" />
          </motion.div>
        </div>

        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#4c3520]">Ratón Sushi</h1>
          <p className="mt-0.5 text-[13px] font-bold text-[#a98d68]">回転寿司 · barra giratoria acogedora</p>
        </div>

        {/* ── Modo RUSH ── */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart("rush")}
          className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#ff9e7d] to-[#ef7f5a] p-3 text-left text-white shadow-[0_10px_24px_rgba(239,127,90,0.42)]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/25">
            <Timer size={22} strokeWidth={2.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-lg font-extrabold leading-tight">
              Servicio rápido <Play size={14} className="fill-white" strokeWidth={3} />
            </span>
            <span className="block text-[11px] font-bold opacity-90">
              90 s · combos ×2.5 · rompe tu récord
            </span>
          </span>
        </motion.button>

        {/* ── Modo ZEN ── */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart("zen")}
          className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#8fbd84] to-[#5f8f5b] p-3 text-left text-white shadow-[0_10px_24px_rgba(95,143,91,0.38)]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/25">
            <Leaf size={22} strokeWidth={2.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg leading-tight font-extrabold">Modo Zen 🍵</span>
            <span className="block text-[11px] font-bold opacity-90">
              Sin reloj · un sushi por nivel · a tu ritmo
            </span>
          </span>
        </motion.button>

        {/* Marcas personales persistidas */}
        <div className="grid w-full grid-cols-2 gap-1.5">
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e8d8ba] bg-[#fffaf1] px-2 py-1.5 text-[11px] font-extrabold text-[#c07f3e]">
            <Trophy size={13} strokeWidth={2.6} className="shrink-0" />
            <span className="truncate">{bestScore.toLocaleString("es-ES")}¥</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#d6e7c4] bg-[#f4faec] px-2 py-1.5 text-[11px] font-extrabold text-[#5f8f5b]">
            <Leaf size={13} strokeWidth={2.6} className="shrink-0" />
            <span className="truncate">Zen nivel {bestZenLevel}</span>
          </div>
        </div>
        <p className="-mt-1.5 text-[10px] font-bold text-[#a98d68]">{zenTitleFor(bestZenLevel)}</p>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-[#a98d68] hover:text-[#6b4a2f]"
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          {muted ? "Sonido apagado" : "Sonido ASMR activado"}
        </button>
      </div>
    </motion.div>
  );
}
