/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Kaiten Bar
 *  Punto de entrada: orquesta las pantallas sobre el hook-máquina
 *  del juego y el hook de layout. El estado sobrevive a los giros
 *  de pantalla porque vive aquí, por encima de los layouts.
 * ────────────────────────────────────────────────────────────────
 */
import { AnimatePresence } from "framer-motion";
import { Background } from "./components/Background";
import { useLayout } from "./hooks/useLayout";
import { useSushiGame } from "./hooks/useSushiGame";
import { GameOverScreen } from "./screens/GameOverScreen";
import { GameScreen } from "./screens/GameScreen";
import { StartScreen } from "./screens/StartScreen";

export default function App() {
  const game = useSushiGame();
  const layout = useLayout();

  return (
    <div className="h-dvh w-full overflow-hidden font-sans">
      <Background />
      <AnimatePresence mode="wait">
        {game.screen === "start" && (
          <StartScreen
            key="start"
            bestScore={game.bestScore}
            bestZenLevel={game.bestZenLevel}
            muted={game.muted}
            onToggleMute={game.toggleMute}
            onStart={game.startGame}
          />
        )}
        {game.screen === "playing" && <GameScreen key="game" game={game} layout={layout} />}
        {game.screen === "over" && <GameOverScreen key="over" game={game} />}
      </AnimatePresence>
    </div>
  );
}
