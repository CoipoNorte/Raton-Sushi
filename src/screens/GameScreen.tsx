/**
 * La mesa de juego, con proporciones calculadas por perfil:
 *
 *  · MÓVIL VERTICAL   → apilado: ticket compacto, plato flexible,
 *    mascota + acciones, cinta de ingredientes en una fila.
 *  · MÓVIL APAISADO   → 3 columnas estrechas, todo compactado
 *    (mascota pequeña, sin textos de ayuda).
 *  · TABLET           → 3 columnas amplias; en vertical, el plato
 *    manda y la despensa va abajo en dos filas cómodas.
 *  · ESCRITORIO       → 3 columnas con topes y atajos de teclado.
 *
 * Los anchos de columna vienen ya resueltos por `useLayout`, en
 * píxeles, para que nunca se aplasten ni se deformen.
 */
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Undo2, UtensilsCrossed } from "lucide-react";
import { Hud } from "../components/Hud";
import { IngredientBar } from "../components/IngredientBar";
import { MouseChef } from "../components/MouseChef";
import { PauseMenu } from "../components/PauseMenu";
import { PlateArea } from "../components/PlateArea";
import { TicketCard } from "../components/TicketCard";
import { LOW_TIME_SECONDS } from "../game/constants";
import type { Mood } from "../game/types";
import type { LayoutInfo } from "../hooks/useLayout";
import { zenTitleFor, type SushiGame } from "../hooks/useSushiGame";

interface GameScreenProps {
  game: SushiGame;
  layout: LayoutInfo;
}

function ActionButtons({ game, size }: { game: SushiGame; size: "sm" | "md" }) {
  const h = size === "sm" ? "h-10" : "h-12";
  const w = size === "sm" ? "w-10" : "w-11";
  const text = size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="relative z-10 flex w-full items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={game.undo}
        disabled={game.plate.length === 0}
        className={`grid ${h} ${w} shrink-0 place-items-center rounded-2xl border border-white/60 bg-white/70 text-[#6b4a2f] shadow-md backdrop-blur-md disabled:opacity-40`}
        aria-label="Deshacer último ingrediente"
        title="Deshacer (Z)"
      >
        <Undo2 size={17} strokeWidth={2.6} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={game.serve}
        disabled={game.plate.length === 0}
        className={`flex ${h} ${text} min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffb36b] via-[#ff9e7d] to-[#ef7f5a] font-extrabold tracking-wide text-white shadow-[0_8px_20px_rgba(239,127,90,0.45)] disabled:saturate-50 disabled:opacity-50`}
        title="Servir (Enter)"
      >
        <UtensilsCrossed size={18} strokeWidth={2.6} className="shrink-0" />
        SERVIR
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={game.clearPlate}
        disabled={game.plate.length === 0}
        className={`grid ${h} ${w} shrink-0 place-items-center rounded-2xl border border-white/60 bg-white/70 text-[#b3543f] shadow-md backdrop-blur-md disabled:opacity-40`}
        aria-label="Limpiar el plato"
        title="Limpiar plato (X)"
      >
        <Trash2 size={17} strokeWidth={2.6} />
      </motion.button>
    </div>
  );
}

/** Cartel de nivel superado (solo modo zen). */
function LevelUpBanner({ level }: { level: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-50 grid place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.6, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className="flex flex-col items-center gap-1 rounded-3xl border border-white/70 bg-white/85 px-6 py-4 shadow-[0_14px_40px_rgba(140,100,60,0.3)] backdrop-blur-md"
      >
        <span className="text-[11px] font-extrabold tracking-widest text-[#a87f4c] uppercase">Nivel superado</span>
        <span className="font-display text-4xl font-extrabold text-[#4c3520]">{level}</span>
        <span className="text-[11px] font-bold text-[#5f8f5b]">{zenTitleFor(level + 1)}</span>
      </motion.div>
    </motion.div>
  );
}

export function GameScreen({ game, layout }: GameScreenProps) {
  const { isPortrait, device, isShort, ticketWidth, pantryWidth, chefSize } = layout;

  /* Atajos de teclado (escritorio) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      // Escape / P abren y cierran la pausa en cualquier momento
      if (k === "escape" || k === "p") {
        e.preventDefault();
        game.togglePause();
        return;
      }
      if (game.paused) return; // el resto de atajos se congela
      if (k === "enter" || k === " ") {
        e.preventDefault();
        game.serve();
      } else if (k === "z") {
        game.undo();
      } else if (k === "x") {
        game.clearPlate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game.serve, game.undo, game.clearPlate, game.togglePause, game.paused]);

  const mood: Mood =
    game.moodFlash === "happy"
      ? "celebrate"
      : game.moodFlash === "sad"
        ? "worried"
        : game.mode === "rush" && game.timeLeft <= LOW_TIME_SECONDS
          ? "worried"
          : "idle";

  const chefNode = <MouseChef mood={mood} size={chefSize} />;

  /**
   * `inScene` → el chef se dibuja dentro de la escena (apaisado).
   * `actions` → los mandos viajan pegados bajo la barra, para que
   * plato, cinta y botones formen un único bloque centrado.
   */
  const plateArea = (inScene: boolean, actions?: ReactNode) => (
    <PlateArea
      layers={game.plate}
      popIndex={game.popIndex}
      shakeKey={game.shakeKey}
      flight={game.flight}
      confettiKey={game.confettiKey}
      gain={game.gain}
      feedback={game.feedback}
      chef={inScene ? chefNode : undefined}
      actions={actions}
      anchor={isPortrait ? "end" : "center"}
    />
  );

  const hud = (
    <Hud
      mode={game.mode}
      timeLeft={game.timeLeft}
      score={game.score}
      streak={game.streak}
      multiplier={game.multiplier}
      served={game.served}
      zenLevel={game.zenLevel}
      muted={game.muted}
      onToggleMute={game.toggleMute}
      onPause={game.togglePause}
    />
  );

  /* Alturas reservadas a la despensa en vertical, por perfil */
  const pantryHeight = device === "mobile" ? 126 : 158;

  return (
    <motion.div
      className="relative z-10 h-dvh w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.28 }}
    >
      {hud}

      <AnimatePresence>{game.levelUp !== null && <LevelUpBanner level={game.levelUp} />}</AnimatePresence>

      <AnimatePresence>
        {game.paused && (
          <PauseMenu
            key="pause"
            mode={game.mode}
            autoAdvance={game.autoAdvance}
            muted={game.muted}
            onToggleAutoAdvance={game.toggleAutoAdvance}
            onToggleMute={game.toggleMute}
            onResume={game.resume}
            onExit={game.endRound}
          />
        )}
      </AnimatePresence>

      {isPortrait ? (
        /* ───────── Vertical (móvil y tablet) ───────── */
        <div
          className="mx-auto flex h-full w-full flex-col gap-1.5 pt-12 pb-[calc(0.4rem+env(safe-area-inset-bottom))]"
          style={{
            maxWidth: device === "mobile" ? "100%" : 720,
            paddingLeft: "max(0.5rem, env(safe-area-inset-left))",
            paddingRight: "max(0.5rem, env(safe-area-inset-right))",
          }}
        >
          <TicketCard
            compact
            order={game.order}
            multiplier={game.multiplier}
            mode={game.mode}
            zenLevel={game.zenLevel}
          />

          <div className="relative min-h-0 flex-1">
            {/* Mandos integrados bajo la barra: plato, cinta y
                botones se mueven como un solo bloque centrado. */}
            {plateArea(false, <ActionButtons game={game} size={device === "mobile" ? "sm" : "md"} />)}
            {/*
              En vertical el plato ocupa todo el ancho, así que el
              itamae se coloca en el aire superior: acompaña sin
              tapar nada y llena el hueco en pantallas altas.
            */}
            <div className="pointer-events-none absolute top-0 left-0 z-20">{chefNode}</div>
          </div>

          <div
            className="shrink-0 rounded-2xl border border-white/50 bg-white/50 px-1.5 pt-1 pb-1.5 backdrop-blur-sm"
            style={{ height: pantryHeight }}
          >
            <IngredientBar
              plate={game.plate}
              target={game.order.layers}
              onAdd={game.addIngredient}
              autoAdvance={game.autoAdvance}
              orderKey={game.order.seq}
              isPortrait
            />
          </div>
        </div>
      ) : (
        /* ───────── Apaisado: tres columnas proporcionales ───────── */
        <div
          className="mx-auto flex h-full max-w-[1460px] items-stretch gap-2.5 pt-12 pb-[calc(0.55rem+env(safe-area-inset-bottom))]"
          style={{
            paddingLeft: "max(0.625rem, env(safe-area-inset-left))",
            paddingRight: "max(0.625rem, env(safe-area-inset-right))",
          }}
        >
          <aside className="shrink-0" style={{ width: ticketWidth }}>
            <TicketCard order={game.order} multiplier={game.multiplier} mode={game.mode} zenLevel={game.zenLevel} />
          </aside>

          {/* Plato, cinta y mandos forman un bloque único centrado:
              así la barra nunca se hunde contra el borde ni deja
              un hueco muerto entre la cinta y los botones. */}
          <main className="relative flex min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1">
              {plateArea(
                !isShort,
                <>
                  <ActionButtons game={game} size={isShort ? "sm" : "md"} />
                  {device === "desktop" && (
                    <p className="mt-1 hidden text-center text-[10px] font-bold text-[#a98d68] [@media(hover:hover)]:block">
                      Enter · servir &nbsp;|&nbsp; Z · deshacer &nbsp;|&nbsp; X · limpiar
                    </p>
                  )}
                </>
              )}
            </div>
          </main>

          <aside
            className="max-h-full shrink-0 self-start overflow-hidden rounded-2xl border border-white/50 bg-white/50 p-1.5 backdrop-blur-sm"
            style={{ width: pantryWidth }}
          >
            <IngredientBar
              plate={game.plate}
              target={game.order.layers}
              onAdd={game.addIngredient}
              autoAdvance={game.autoAdvance}
              orderKey={game.order.seq}
              isPortrait={false}
            />
          </aside>
        </div>
      )}
    </motion.div>
  );
}
