/**
 * ────────────────────────────────────────────────────────────────
 *  Modo PEDIDOS · selección de niveles
 *
 *  8 comandas con meta fija (N pedidos en X segundos) y escalera
 *  de dificultad suave. Cada nivel guarda de 1 a 3 estrellas
 *  según lo rápido que cierres la comanda, y se desbloquea al
 *  superar el anterior. Rejugable para redondear las 3 estrellas.
 * ────────────────────────────────────────────────────────────────
 */
import { motion } from "framer-motion";
import { ChefHat, Home, Lock, Star, Timer } from "lucide-react";
import { MouseChef } from "../components/MouseChef";
import { LEVELS } from "../game/constants";
import { isLevelUnlocked } from "../hooks/useSushiGame";

interface LevelSelectScreenProps {
  levelStars: number[];
  onPlay: (index: number) => void;
  onBack: () => void;
}

/** Fila de 3 estrellas (llenas / vacías). */
function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} de 3 estrellas`}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={2.4}
          className={i < value ? "fill-[#e8b04b] text-[#e8b04b]" : "fill-transparent text-[#d9c4a0]"}
        />
      ))}
    </span>
  );
}

export function LevelSelectScreen({ levelStars, onPlay, onBack }: LevelSelectScreenProps) {
  const totalStars = levelStars.reduce((a, b) => a + b, 0);
  const maxStars = LEVELS.length * 3;

  return (
    <motion.div
      className="relative z-10 flex h-dvh overflow-y-auto p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <div className="m-auto flex w-full max-w-[560px] flex-col gap-3 rounded-3xl border border-white/60 bg-white/55 p-4 shadow-[0_20px_50px_rgba(140,100,60,0.22)] backdrop-blur-md">
        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <MouseChef mood="idle" size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl leading-tight font-extrabold text-[#4c3520]">
              Pedidos
            </h2>
            <p className="text-[11px] font-bold text-[#a98d68]">
              Completa la comanda antes de que cierre la barra
            </p>
          </div>
          {/* Progreso global de estrellas, con barra de avance */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#c07f3e]">
              <Star size={13} strokeWidth={2.6} className="fill-[#e8b04b] text-[#e8b04b]" />
              {totalStars}/{maxStars}
            </span>
            <span className="block h-1.5 w-16 overflow-hidden rounded-full bg-[#ece0c8]">
              <motion.span
                className="block h-full rounded-full bg-gradient-to-r from-[#e8b04b] to-[#ff9e7d]"
                initial={{ width: 0 }}
                animate={{ width: `${(totalStars / maxStars) * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
              />
            </span>
          </div>
        </div>

        {/* Rejilla de niveles */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LEVELS.map((lv, i) => {
            const stars = levelStars[i] ?? 0;
            const unlocked = isLevelUnlocked(i, levelStars);
            return (
              <motion.button
                key={lv.id}
                type="button"
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.03 } : undefined}
                whileTap={unlocked ? { scale: 0.95 } : undefined}
                onClick={() => unlocked && onPlay(i)}
                className={`relative flex flex-col items-start gap-1 rounded-2xl border p-2.5 text-left transition-colors ${
                  unlocked
                    ? "border-[#e8d8ba] bg-[#fffaf1] shadow-[0_3px_10px_rgba(140,100,60,0.14)] hover:bg-[#fff4e2]"
                    : "cursor-not-allowed border-[#e3d2b2] bg-[#efe3cb] opacity-60"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-xl text-[13px] font-extrabold ${
                      stars > 0
                        ? "bg-[#7fae7a] text-white"
                        : unlocked
                          ? "bg-[#ffd9c0] text-[#b3543f]"
                          : "bg-[#d9c9ab] text-[#8a7458]"
                    }`}
                  >
                    {unlocked ? lv.id : <Lock className="size-3.5" strokeWidth={3} />}
                  </span>
                  <Stars value={stars} size={11} />
                </div>

                <span className="w-full truncate text-[11.5px] leading-tight font-extrabold text-[#4c3520]">
                  {lv.name}
                </span>

                <div className="flex w-full items-center gap-2 text-[10px] font-bold text-[#a98d68]">
                  <span className="flex items-center gap-0.5">
                    <ChefHat className="size-3" strokeWidth={2.8} />
                    {lv.goal}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Timer className="size-3" strokeWidth={2.8} />
                    {lv.seconds}s
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-[10px] font-bold text-[#a98d68]">
          ⭐⭐⭐ si te sobra mucho tiempo · el nivel se abre al superar el anterior
        </p>

        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#e3d2b2] py-2 text-[12px] font-extrabold text-[#a98d68] hover:text-[#6b4a2f]"
        >
          <Home className="size-4" />
          Volver a la entrada
        </button>
      </div>
    </motion.div>
  );
}
