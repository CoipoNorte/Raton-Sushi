/**
 * HUD flotante y mínimo, consciente del modo de juego:
 * · RUSH → barra de tiempo de 5 px pegada al borde superior (roja
 *   y palpitante en los últimos 10 s) + pastillas de tiempo,
 *   yenes, combo y servidos.
 * · ZEN  → sin reloj ni barra: pastilla de NIVEL y de piezas,
 *   nada que meta prisa. Botón de salida siempre accesible.
 * Las pastillas se encogen con container queries para no
 * desbordar jamás en pantallas estrechas.
 */
import { motion } from "framer-motion";
import { ChefHat, Coins, Flame, Leaf, Pause, Timer, Volume2, VolumeX } from "lucide-react";
import { LOW_TIME_SECONDS, ROUND_SECONDS } from "../game/constants";
import type { GameMode } from "../game/types";

interface HudProps {
  mode: GameMode;
  timeLeft: number;
  score: number;
  streak: number;
  multiplier: number;
  served: number;
  zenLevel: number;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

const pill =
  "pointer-events-auto flex shrink-0 items-center gap-1 rounded-full border border-white/60 bg-white/60 px-2 py-1 text-[10.5px] font-extrabold text-[#5b4128] shadow-[0_2px_8px_rgba(140,100,60,0.15)] backdrop-blur-md @[420px]:px-2.5 @[420px]:text-[11.5px]";

/**
 * Botón redondo de acción del HUD. El icono se dibuja al 62 % del
 * botón mediante un SVG que escala solo (sin tamaños fijos en px),
 * así se mantiene grande y legible en cualquier densidad.
 */
function RoundButton({
  Icon,
  label,
  onClick,
}: {
  Icon: typeof Pause;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.86 }}
      whileHover={{ scale: 1.06 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="pointer-events-auto grid size-9 shrink-0 place-items-center rounded-full border border-white/60 bg-white/65 text-[#5b4128] shadow-[0_2px_8px_rgba(140,100,60,0.18)] backdrop-blur-md @[420px]:size-10"
    >
      <Icon className="size-[62%]" strokeWidth={2.6} absoluteStrokeWidth />
    </motion.button>
  );
}

export function Hud({
  mode,
  timeLeft,
  score,
  streak,
  multiplier,
  served,
  zenLevel,
  muted,
  onToggleMute,
  onPause,
}: HudProps) {
  const isZen = mode === "zen";
  const low = !isZen && timeLeft <= LOW_TIME_SECONDS;
  const pct = Math.max(0, Math.min(100, (timeLeft / ROUND_SECONDS) * 100));

  return (
    <>
      {/* Barra de tiempo: solo en rush */}
      {!isZen && (
        <div className="absolute inset-x-0 top-0 z-40 h-[5px] bg-black/5">
          <motion.div
            className="h-full origin-left rounded-r-full"
            style={{
              background: low
                ? "linear-gradient(90deg,#ef5b4c,#ff8a6b)"
                : "linear-gradient(90deg,#7fae7a,#e8b04b,#ff9e7d)",
            }}
            animate={{ width: `${pct}%`, opacity: low ? [1, 0.45, 1] : 1 }}
            transition={{
              width: { duration: 0.12, ease: "linear" },
              opacity: low ? { duration: 0.7, repeat: Infinity } : { duration: 0.2 },
            }}
          />
        </div>
      )}
      {/* En zen, un hilo verde sereno marca el borde superior */}
      {isZen && (
        <div className="absolute inset-x-0 top-0 z-40 h-[5px] bg-gradient-to-r from-[#7fae7a] via-[#b5d26f] to-[#7fae7a] opacity-70" />
      )}

      {/* Pastillas flotantes */}
      <div
        className="@container pointer-events-none absolute top-2.5 z-40 flex items-start gap-1.5"
        style={{
          left: "max(0.5rem, env(safe-area-inset-left))",
          right: "max(0.5rem, env(safe-area-inset-right))",
        }}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {isZen ? (
            <motion.span
              key={zenLevel}
              className={`${pill} bg-gradient-to-r from-[#cfe6b8]/80 to-[#eaf4d8]/80`}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
            >
              <Leaf size={12} strokeWidth={3} className="text-[#5f8f5b]" />
              Nivel {zenLevel}
            </motion.span>
          ) : (
            <motion.span
              className={pill}
              animate={low ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 0.6, repeat: low ? Infinity : 0 }}
            >
              <Timer size={12} strokeWidth={3} className={low ? "text-[#ef5b4c]" : "text-[#7fae7a]"} />
              <span className={low ? "text-[#d43c2e]" : ""}>{Math.ceil(timeLeft)}s</span>
            </motion.span>
          )}

          <span className={pill}>
            <Coins size={12} strokeWidth={3} className="text-[#e8b04b]" />
            {score.toLocaleString("es-ES")}¥
          </span>

          {!isZen && streak >= 2 && (
            <motion.span
              key={streak}
              className={`${pill} bg-gradient-to-r from-[#ffb36b]/70 to-[#ff8f5c]/70`}
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
            >
              <Flame size={12} strokeWidth={3} className="text-[#e25822]" />
              ×{multiplier.toFixed(1)}
            </motion.span>
          )}

          <span className={`${pill} hidden @[330px]:flex`}>
            <ChefHat size={12} strokeWidth={3} className="text-[#a87f4c]" />
            {served}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <RoundButton
            Icon={muted ? VolumeX : Volume2}
            label={muted ? "Activar sonido" : "Silenciar"}
            onClick={onToggleMute}
          />
          <RoundButton Icon={Pause} label="Pausa y ajustes" onClick={onPause} />
        </div>
      </div>
    </>
  );
}
