/**
 * Fin de ronda: la barra cierra, el ratoncito brinda contigo las
 * cuentas de la jornada. Muestra yenes, pedidos perfectos, mejor
 * combo y la fanfarria de récord (persistido en localStorage).
 */
import { motion } from "framer-motion";
import { ChefHat, Coins, Flame, Home, Leaf, RotateCcw, Trophy } from "lucide-react";
import { MouseChef } from "../components/MouseChef";
import { multiplierFor } from "../game/logic";
import type { SushiGame } from "../hooks/useSushiGame";

interface GameOverScreenProps {
  game: SushiGame;
}

export function GameOverScreen({ game }: GameOverScreenProps) {
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

        {/* Caja registradora */}
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
            <div className="text-lg font-extrabold text-[#4c3520]">×{multiplierFor(Math.max(1, game.bestCombo)).toFixed(1)}</div>
            <div className="text-[9px] font-bold text-[#a98d68]">mejor combo</div>
          </div>
          <div className="rounded-xl bg-[#fffaf1]/90 p-2 shadow-sm">
            <Trophy size={15} strokeWidth={2.6} className="mx-auto text-[#e8b04b]" />
            <div className="text-lg font-extrabold text-[#4c3520]">{game.bestScore.toLocaleString("es-ES")}</div>
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

        {/* Invitación a relajarse en zen tras la carrera */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => game.startGame("zen")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#cfe0bd] bg-[#f4faec] py-2.5 text-sm font-extrabold text-[#5f8f5b]"
        >
          <Leaf size={15} strokeWidth={2.8} />
          Relajarme en modo Zen
        </motion.button>
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
