/**
 * Zona protagonista: el plato de trabajo sobre la cinta kaiten.
 * · El SVG escala por ALTURA disponible (nunca se deforma).
 * · Pop de colocación y vierte de salsa (motor SushiRenderer).
 * · Sacudida al fallar conservando la pieza.
 * · Dropzone ([data-dropzone]) que se ilumina cuando arrastras
 *   una ficha desde la barra de ingredientes.
 * · Al acertar: copia del plato sale deslizándose por la cinta
 *   hacia el cliente + popup de yenes + confetti + "¡Arigatō!".
 */
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import type { Feedback, Gain } from "../game/types";
import { Confetti } from "./Confetti";
import { SushiRenderer } from "./sushi/SushiRenderer";

interface PlateAreaProps {
  layers: string[];
  popIndex: number;
  shakeKey: number;
  flight: string[] | null;
  confettiKey: number;
  gain: Gain | null;
  feedback: Feedback | null;
  /** Mascota opcional: se dibuja de pie tras la barra kaiten. */
  chef?: ReactNode;
  /**
   * Botones de acción opcionales. Se montan DENTRO del grupo
   * centrado, justo bajo la cinta, para que plato, barra y
   * mandos viajen juntos y no queden separados por un hueco.
   */
  actions?: ReactNode;
  /**
   * Dónde se asienta el bloque plato+cinta+mandos:
   *  · "center" → apaisado, el aire se reparte arriba y abajo.
   *  · "end"    → vertical, la escena baja hasta rozar la despensa
   *    y todo el aire sobrante queda arriba, donde saluda el chef
   *    (antes quedaba un hueco muerto entre SERVIR y la vitrina).
   */
  anchor?: "center" | "end";
}

export function PlateArea({
  layers,
  popIndex,
  shakeKey,
  flight,
  confettiKey,
  gain,
  feedback,
  chef,
  actions,
  anchor = "center",
}: PlateAreaProps) {
  const shake = useAnimationControls();
  const [dropHot, setDropHot] = useState(false);

  useEffect(() => {
    if (shakeKey > 0) {
      shake.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.42, ease: "easeInOut" } });
    }
  }, [shakeKey, shake]);

  /* Resalta el plato mientras llega una ficha arrastrada */
  useEffect(() => {
    const onDrag = (e: Event) => {
      setDropHot((e as CustomEvent<{ active: boolean }>).detail.active);
    };
    window.addEventListener("sushi:chip-drag", onDrag);
    return () => window.removeEventListener("sushi:chip-drag", onDrag);
  }, []);

  return (
    <div
      className={`relative mx-auto flex h-full min-h-0 w-full max-w-[760px] flex-col items-center ${
        anchor === "end" ? "justify-end" : "justify-center"
      }`}
    >
      {/*
        El grupo plato + cinta se centra verticalmente: el aire
        sobrante se reparte arriba y abajo en vez de acumularse en
        un hueco enorme sobre la escena (antes la barra se hundía
        contra los botones y dejaba media pantalla vacía arriba).
      */}
      {/* El itamae saluda desde el aire superior izquierdo: dentro
          de la escena (no invade el ticket) y sin pisar el plato. */}
      {chef && <div className="pointer-events-none absolute top-0 left-0 z-20">{chef}</div>}
      <motion.div
        animate={shake}
        data-dropzone
        className="relative flex min-h-0 w-full shrink items-end justify-center"
      >
        {/* aura cálida del punto de montaje */}
        <div className="pointer-events-none absolute inset-x-[10%] top-[12%] bottom-[8%] rounded-[50%] bg-[#ffe7bd] opacity-50 blur-2xl" />

        {/* anillo de dropzone al arrastrar ingredientes */}
        <AnimatePresence>
          {dropHot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: [1, 1.03, 1] }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                opacity: { duration: 0.18 },
                scale: { duration: 0.9, repeat: Infinity },
              }}
              className="pointer-events-none absolute inset-x-[6%] inset-y-[4%] z-20 grid place-items-center rounded-[36px] border-[3px] border-dashed border-[#ef7f5a] bg-[#ff9e7d]/10"
            >
              <span className="rounded-full bg-[#ef7f5a] px-3 py-1 text-[11px] font-extrabold text-white shadow-lg">
                Suelta en el plato
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* La pieza: crece por altura disponible sin deformarse */}
        <SushiRenderer
          layers={layers}
          animated
          popIndex={popIndex}
          align="bottom"
          /* Tope de tamaño: en monitores grandes el plato no debe
             volverse descomunal; se mantiene apetecible y centrado. */
          className="relative z-10 mx-auto block h-auto max-h-full w-full max-w-[min(100%,620px)] drop-shadow-[0_14px_16px_rgba(120,85,50,0.28)]"
        />

        {/*
          Ayuda del plato vacío: va POR ENCIMA del sushi (z-20) y en
          una píldora con fondo propio, nunca detrás del dibujo ni
          recortada por el contenedor.
        */}
        {layers.length === 0 && !dropHot && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-2 top-1/2 z-20 flex -translate-y-1/2 justify-center"
          >
            <span className="max-w-full rounded-2xl border border-white/70 bg-white/75 px-3 py-1.5 text-center text-[11px] leading-snug font-bold text-balance text-[#8a6a45] shadow-sm backdrop-blur-sm sm:text-[12.5px]">
              Toca o arrastra ingredientes para montar el nigiri
            </span>
          </motion.div>
        )}

        {/* Popup de yenes ganados */}
        <AnimatePresence>
          {gain && (
            <motion.div
              key={gain.key}
              className="pointer-events-none absolute left-1/2 top-[4%] z-30 -translate-x-1/2"
              initial={{ opacity: 0, y: 14, scale: 0.7 }}
              animate={{ opacity: [0, 1, 1, 0], y: -48, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.35, times: [0, 0.16, 0.75, 1], ease: "easeOut" }}
            >
              <span className="rounded-full bg-gradient-to-r from-[#e8b04b] to-[#ff9e7d] px-3 py-1 text-sm font-extrabold whitespace-nowrap text-white shadow-lg">
                +{gain.gained}¥ {gain.multiplier > 1 && <em className="not-italic opacity-90">×{gain.multiplier.toFixed(1)}</em>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Confetti burstKey={confettiKey} />
      </motion.div>

      {/* Cinta transportadora kaiten (contenida: nunca desborda) */}
      <div
        className="relative z-0 mx-auto w-full max-w-[min(100%,700px)] shrink-0 overflow-hidden rounded-xl"
        aria-hidden="true"
      >
        <div className="h-2 w-full bg-gradient-to-b from-[#8a6f4d] to-[#6b5335]" />
        <div className="kaiten-belt h-6 w-full opacity-90" />
        <div className="h-1.5 w-full bg-[#6b5335]" />

        {/* Plato servido volando hacia el cliente */}
        {flight && (
          <motion.div
            className="absolute -top-16 left-1/2 z-20 w-[148px] -translate-x-1/2"
            initial={{ x: 0, opacity: 1, rotate: 0 }}
            animate={{ x: "-62vw", opacity: [1, 1, 0.4], rotate: -4 }}
            transition={{ duration: 0.95, ease: "easeIn" }}
          >
            <SushiRenderer layers={flight} className="h-auto w-full drop-shadow-lg" />
          </motion.div>
        )}
        {flight && (
          <motion.span
            className="absolute -top-24 left-[16%] z-20 rounded-2xl rounded-bl-sm border border-[#e8d8ba] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#6b4a2f] shadow-md"
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: -6, scale: 1 }}
            transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1] }}
          >
            ¡Arigatō!
          </motion.span>
        )}
      </div>

      {/* Mandos justo bajo la barra: viajan con la escena */}
      {actions && <div className="mt-2 w-full max-w-[440px] shrink-0">{actions}</div>}

      {/* Mensaje de feedback tras SERVIR */}
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback.key}
            /* Flota siempre justo encima de la barra, tenga o no
               los mandos integrados debajo. */
            className={`pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 ${
              actions ? "bottom-[6.2rem]" : "bottom-11"
            }`}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold whitespace-nowrap shadow-md ${
                feedback.kind === "success"
                  ? "bg-[#5f8f5b] text-white"
                  : "bg-[#fff3e1] text-[#b3543f] border border-[#e9b9a4]"
              }`}
            >
              {feedback.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
