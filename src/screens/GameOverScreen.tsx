/**
 * Fin de ronda. Tiene dos caras:
 *  · RUSH   → caja registradora, récord histórico y mejor combo.
 *  · PEDIDOS→ resultado del nivel con 1-3 estrellas, bonus de
 *             comanda y acceso directo al siguiente nivel.
 */
import { motion } from "framer-motion";
import {
  ChefHat,
  Coins,
  Flame,
  Home,
  Leaf,
  ListChecks,
  RotateCcw,
  Star,
  Timer,
  Trophy,
} from "lucide-react";
import { MouseChef } from "../components/MouseChef";
import { LEVELS } from "../game/constants";
import { multiplierFor } from "../game/logic";
import type { SushiGame } from "../hooks/useSushiGame";

interface GameOverScreenProps {
  game: SushiGame;
}

/** Estrellas grandes con entrada escalonada. */
function BigStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: i < value ? 1 : 0.8, rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.15 + i * 0.18 }}
        >
          <Star
            size={i === 1 ? 44 : 36}
            strokeWidth={2.2}
            className={
              i < value
                ? "fill-[#e8b04b] text-[#e8b04b] drop-shadow-[0_3px_6px_rgba(232,176,75,0.5)]"
                : "fill-[#ece0c8] text-[#d9c4a0]"
            }
          />
        </motion.div>
      ))}
    </div>
  );
}

export function GameOverScreen({ game }: GameOverScreenProps) {
  const outcome = game.levelOutcome;
  const isLevels = game.mode === "levels" && outcome !== null;

  /* ─────────────── Resultado de un nivel de Pedidos ─────────── */
  if (isLevels) {
    const def = LEVELS[game.levelIndex];
    const won = outcome.won;
    const hasNext = game.levelIndex + 1 < LEVELS.length;
    const improved = won && outcome.stars > outcome.previousStars;

    return (
      <motion.div
        className="relative z-10 flex h-dvh overflow-y-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
      >
        <div className="m-auto flex w-full max-w-[380px] flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_20px_50px_rgba(140,100,60,0.22)] backdrop-blur-md">
          <MouseChef mood={won ? "celebrate" : "worried"} size={112} />

          <div className="text-center">
            <p className="text-[11px] font-extrabold tracking-widest text-[#a87f4c] uppercase">
              Nivel {def.id} · {def.name}
            </p>
            <h2 className="font-display text-2xl font-extrabold text-[#4c3520]">
              {won ? "¡Comanda completa!" : "Se cerró la barra"}
            </h2>
            <p className="text-[12px] font-bold text-[#a98d68]">
              {won
                ? `${def.goal} pedidos perfectos servidos`
                : `Te faltaron ${Math.max(0, def.goal - game.served)} pedidos`}
            </p>
          </div>

          {won && <BigStars value={outcome.stars} />}

          {improved && (
            <motion.span
              className="rounded-full bg-gradient-to-r from-[#e8b04b] to-[#ff9e7d] px-3 py-1 text-[11px] font-extrabold text-white shadow"
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            >
              ¡Nueva mejor marca del nivel!
            </motion.span>
          )}

          <div className="grid w-full grid-cols-3 gap-1.5 text-center">
            <div className="rounded-xl bg-[#fffaf1]/90 p-2 shadow-sm">
              <ChefHat size={15} strokeWidth={2.6} className="mx-auto text-[#a87f4c]" />
              <div className="text-lg font-extrabold text-[#4c3520]">
                {game.served}/{def.goal}
              </div>
              <div className="text-[9px] font-bold text-[#a98d68]">pedidos</div>
            </div>
            <div className="rounded-xl bg-[#fffaf1]/90 p-2 shadow-sm">
              <Timer size={15} strokeWidth={2.6} className="mx-auto text-[#7fae7a]" />
              <div className="text-lg font-extrabold text-[#4c3520]">
                {Math.ceil(game.timeLeft)}s
              </div>
              <div className="text-[9px] font-bold text-[#a98d68]">restantes</div>
            </div>
            <div className="rounded-xl bg-[#fffaf1]/90 p-2 shadow-sm">
              <Coins size={15} strokeWidth={2.6} className="mx-auto text-[#e8b04b]" />
              <div className="text-lg font-extrabold text-[#4c3520]">
                {game.score.toLocaleString("es-ES")}
              </div>
              <div className="text-[9px] font-bold text-[#a98d68]">yenes</div>
            </div>
          </div>

          {won && hasNext && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={game.nextLevel}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7fae7a] to-[#5f8f5b] py-3.5 text-lg font-extrabold text-white shadow-[0_10px_24px_rgba(95,143,91,0.4)]"
            >
              Siguiente nivel
              <span className="text-xl">→</span>
            </motion.button>
          )}

          {won && !hasNext && (
            <div className="w-full rounded-2xl border border-[#e8d8ba] bg-[#fffaf1] px-3 py-2.5 text-center">
              <Trophy size={18} strokeWidth={2.6} className="mx-auto text-[#e8b04b]" />
              <p className="text-[12px] font-extrabold text-[#4c3520]">
                ¡Has superado las 8 comandas!
              </p>
              <p className="text-[10px] font-bold text-[#a98d68]">
                Vuelve a por las estrellas que falten
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => game.startLevel(game.levelIndex)}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-base font-extrabold ${
              won
                ? "border border-[#e8d8ba] bg-[#fffaf1] text-[#a87f4c]"
                : "bg-gradient-to-r from-[#ff9e7d] to-[#ef7f5a] text-white shadow-[0_10px_24px_rgba(239,127,90,0.42)]"
            }`}
          >
            <RotateCcw size={17} strokeWidth={2.8} />
            Reintentar nivel
          </motion.button>

          <button
            onClick={game.openLevels}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-[#a98d68] hover:text-[#6b4a2f]"
          >
            <ListChecks size={13} />
            Elegir otro nivel
          </button>
        </div>
      </motion.div>
    );
  }

  /* ─────────────── Resultado del servicio rápido ────────────── */
  return (
    <motion.div
      className="relative z-10 flex h-dvh overflow-y-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <div className="m-auto flex w-full max-w-[380px] flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_20px_50px_rgba(140,100,60,0.22)] backdrop-blur-md">
        <MouseChef mood={game.isRecord ? "celebrate" : "happy"} size={120} />

        <div className="text-center">
          <h2 className="font-display text-2xl font-extrabold text-[#4c3520]">
            {game.isRecord ? "¡Récord de la casa!" : "¡Hora de cerrar la barra!"}
          </h2>
          <p className="text-[12px] font-bold text-[#a98d68]">
            {game.isRecord ? "El vecindario hablará de tu sushi" : "El chef recoge los cuchillos"}
          </p>
        </div>

        {game.isRecord && (
          <motion.div
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8b04b] to-[#ff9e7d] px-3 py-1 text-xs font-extrabold text-white shadow-lg"
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          >
            <Trophy size={13} strokeWidth={2.6} />
            NUEVO RÉCORD HISTÓRICO
          </motion.div>
        )}

        <div className="flex items-baseline gap-1.5">
          <Coins size={22} className="translate-y-0.5 text-[#e8b04b]" strokeWidth={2.6} />
          <span className="font-display text-5xl font-extrabold text-[#4c3520]">
            {game.score.toLocaleString("es-ES")}
          </span>
          <span className="text-xl font-extrabold text-[#c07f3e]">¥</span>
        </div>

        <div className="grid w-full grid-cols-3 gap-1.5 text-center">
          <div className="rounded-xl bg-[#fffaf1]/90 p-2 shadow-sm">
            <ChefHat size={15} strokeWidth={2.6} className="mx-auto text-[#a87f4c]" />
            <div className="text-lg font-extrabold text-[#4c3520]">{game.served}</div>
            <div className="text-[9px] font-bold text-[#a98d68]">pedidos perfectos</div>
          </div>
          <div className="rounded-xl bg-[#fffaf1]/90 p-2 shadow-sm">
            <Flame size={15} strokeWidth={2.6} className="mx-auto text-[#e25822]" />
            <div className="text-lg font-extrabold text-[#4c3520]">
              ×{multiplierFor(Math.max(1, game.bestCombo)).toFixed(1)}
            </div>
            <div className="text-[9px] font-bold text-[#a98d68]">mejor combo</div>
          </div>
          <div className="rounded-xl bg-[#fffaf1]/90 p-2 shadow-sm">
            <Trophy size={15} strokeWidth={2.6} className="mx-auto text-[#e8b04b]" />
            <div className="text-lg font-extrabold text-[#4c3520]">
              {game.bestScore.toLocaleString("es-ES")}
            </div>
            <div className="text-[9px] font-bold text-[#a98d68]">récord ¥</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => game.startGame("rush")}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff9e7d] to-[#ef7f5a] py-3.5 text-lg font-extrabold text-white shadow-[0_10px_24px_rgba(239,127,90,0.42)]"
        >
          <RotateCcw size={18} strokeWidth={2.8} />
          Otra ronda
        </motion.button>

        <div className="grid w-full grid-cols-2 gap-1.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={game.openLevels}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#f0d7bd] bg-[#fff6ea] py-2.5 text-[12.5px] font-extrabold text-[#c07f3e]"
          >
            <ListChecks size={14} strokeWidth={2.8} />
            Pedidos
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => game.startGame("zen")}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#cfe0bd] bg-[#f4faec] py-2.5 text-[12.5px] font-extrabold text-[#5f8f5b]"
          >
            <Leaf size={14} strokeWidth={2.8} />
            Zen
          </motion.button>
        </div>

        <button
          onClick={game.goHome}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-[#a98d68] hover:text-[#6b4a2f]"
        >
          <Home size={13} />
          Volver a la entrada
        </button>
      </div>
    </motion.div>
  );
}
