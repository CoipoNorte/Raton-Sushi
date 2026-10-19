/**
 * ────────────────────────────────────────────────────────────────
 *  Menú de PAUSA · ajustes de la partida
 *
 *  Congela el reloj (en modo rápido) y ofrece las preferencias
 *  del jugador, todas persistentes:
 *   · Auto-avance de pestañas (activado por defecto).
 *   · Sonido ASMR.
 *  Más las salidas: seguir cocinando o volver al menú principal.
 * ────────────────────────────────────────────────────────────────
 */
import { motion } from "framer-motion";
import { Home, Leaf, Play, Volume2, VolumeX, Wand2 } from "lucide-react";
import type { GameMode } from "../game/types";

interface PauseMenuProps {
  mode: GameMode;
  autoAdvance: boolean;
  muted: boolean;
  onToggleAutoAdvance: () => void;
  onToggleMute: () => void;
  onResume: () => void;
  onExit: () => void;
}

/** Interruptor estilo "pastilla" acorde a la estética del bar. */
function Toggle({
  on,
  Icon,
  title,
  hint,
  onClick,
}: {
  on: boolean;
  Icon: typeof Wand2;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="flex w-full items-center gap-3 rounded-2xl border border-[#e8d8ba] bg-[#fffaf1] p-2.5 text-left transition-colors hover:bg-[#fff4e2]"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${
          on ? "bg-[#7fae7a] text-white" : "bg-[#ece0c8] text-[#a98d68]"
        }`}
      >
        <Icon className="size-[58%]" strokeWidth={2.6} absoluteStrokeWidth />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-tight font-extrabold text-[#4c3520]">{title}</span>
        <span className="block text-[10.5px] leading-tight font-bold text-[#a98d68]">{hint}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-[#7fae7a]" : "bg-[#d9c9ab]"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 32 }}
          className="absolute top-0.5 size-5 rounded-full bg-white shadow"
          style={{ left: on ? 22 : 2 }}
        />
      </span>
    </button>
  );
}

export function PauseMenu({
  mode,
  autoAdvance,
  muted,
  onToggleAutoAdvance,
  onToggleMute,
  onResume,
  onExit,
}: PauseMenuProps) {
  return (
    <motion.div
      className="absolute inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#4c3520]/35 p-4 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onResume}
    >
      <motion.div
        className="m-auto flex w-full max-w-[340px] flex-col gap-2.5 rounded-3xl border border-white/70 bg-[#fdf6ea] p-4 shadow-[0_24px_60px_rgba(76,53,32,0.35)]"
        initial={{ scale: 0.88, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="font-display text-2xl font-extrabold text-[#4c3520]">Pausa</h2>
          <p className="text-[11px] font-bold text-[#a98d68]">
            {mode === "zen"
              ? "El arroz te espera, sin prisa 🍵"
              : mode === "levels"
                ? "Comanda en espera · reloj detenido"
                : "El reloj está detenido"}
          </p>
        </div>

        <Toggle
          on={autoAdvance}
          Icon={Wand2}
          title="Auto-avance de pestañas"
          hint="Al completar una sección, salta sola a la siguiente"
          onClick={onToggleAutoAdvance}
        />

        <Toggle
          on={!muted}
          Icon={muted ? VolumeX : Volume2}
          title="Sonido ASMR"
          hint="Cuchillo, madera y soplete aburi"
          onClick={onToggleMute}
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onResume}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffb36b] to-[#ef7f5a] py-3 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(239,127,90,0.42)]"
        >
          <Play className="size-5 fill-white" strokeWidth={3} />
          Seguir cocinando
        </motion.button>

        <button
          onClick={onExit}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-[#e3d2b2] py-2 text-[12px] font-extrabold text-[#a98d68] hover:text-[#6b4a2f]"
        >
          {mode === "zen" ? <Leaf className="size-4" /> : <Home className="size-4" />}
          {mode === "zen"
            ? "Terminar sesión zen"
            : mode === "levels"
              ? "Salir a los niveles"
              : "Terminar la ronda"}
        </button>
      </motion.div>
    </motion.div>
  );
}
