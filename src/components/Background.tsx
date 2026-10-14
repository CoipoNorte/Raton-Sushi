/**
 * Fondo ambiental del sushi bar: degradados cálidos, halos de
 * luz de lámpara, motas de vapor de arroz y hojas de bambú que
 * CAEN desde arriba meciéndose con la brisa.
 * Capa puramente decorativa (pointer-events: none).
 */
import { useMemo } from "react";
import { motion } from "framer-motion";

interface Mote {
  left: string;
  top: string;
  size: number;
  delay: number;
  dur: number;
  opacity: number;
}

interface Leaf {
  left: number;
  /** Deriva horizontal total mientras cae (px). */
  drift: number;
  size: number;
  /** Giro inicial y total de rotación durante la caída. */
  rot: number;
  spin: number;
  dur: number;
  delay: number;
  opacity: number;
  tone: string;
}

export function Background() {
  const motes = useMemo<Mote[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: `${6 + ((i * 83) % 90)}%`,
        top: `${12 + ((i * 37) % 76)}%`,
        size: 5 + ((i * 7) % 9),
        delay: (i * 0.7) % 3.4,
        dur: 3 + ((i * 13) % 4),
        opacity: 0.25 + ((i * 5) % 5) * 0.08,
      })),
    []
  );

  /*
   * Hojas de bambú en caída libre: cada una entra por encima del
   * borde superior, desciende todo el alto de la pantalla, se
   * mece lateralmente (brisa) y gira despacio. Los desfases
   * hacen que nunca caigan sincronizadas.
   */
  const leaves = useMemo<Leaf[]>(() => {
    const tones = ["#7fae7a", "#8fbd84", "#9ac98e", "#6f9c6a"];
    return Array.from({ length: 9 }, (_, i) => ({
      left: 4 + ((i * 97) % 92),
      drift: (i % 2 === 0 ? 1 : -1) * (26 + ((i * 17) % 46)),
      size: 26 + ((i * 11) % 24),
      rot: (i * 47) % 360,
      spin: (i % 2 === 0 ? 1 : -1) * (140 + ((i * 23) % 160)),
      dur: 15 + ((i * 7) % 11),
      delay: (i * 2.1) % 14,
      opacity: 0.2 + ((i * 3) % 4) * 0.07,
      tone: tones[i % tones.length],
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Degradado base cálido */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbefd9] via-[#f7e6c9] to-[#efd9b8]" />
      {/* Halos tipo lámpara de papel */}
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#ffe9c2] opacity-60 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#dfe9d0] opacity-50 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#f6d9c4] opacity-40 blur-3xl" />

      {/* Motas de vapor de arroz ascendiendo en bucle */}
      {motes.map((m, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: m.left, top: m.top, width: m.size, height: m.size, filter: "blur(2px)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, m.opacity, 0], y: -34 }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Hojas de bambú cayendo con la brisa */}
      {leaves.map((l, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 60 60"
          width={l.size}
          height={l.size}
          className="absolute -top-16"
          style={{ left: `${l.left}%` }}
          initial={{ y: "-10vh", x: 0, rotate: l.rot, opacity: 0 }}
          animate={{
            // Caída continua de arriba abajo de la pantalla
            y: ["-10vh", "112vh"],
            // Vaivén lateral: la brisa la empuja y la devuelve
            x: [0, l.drift, -l.drift * 0.6, l.drift * 0.35, 0],
            rotate: [l.rot, l.rot + l.spin],
            // Aparece al entrar y se desvanece al llegar al suelo
            opacity: [0, l.opacity, l.opacity, l.opacity, 0],
          }}
          transition={{
            duration: l.dur,
            delay: l.delay,
            repeat: Infinity,
            ease: "linear",
            x: { duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: l.dur, delay: l.delay, repeat: Infinity, ease: "linear" },
            opacity: {
              duration: l.dur,
              delay: l.delay,
              repeat: Infinity,
              times: [0, 0.08, 0.5, 0.9, 1],
              ease: "linear",
            },
          }}
        >
          <path d="M8 52 Q14 24 52 10 Q46 40 8 52 Z" fill={l.tone} />
          <path d="M12 48 Q28 30 48 14" stroke="#5f8f5b" strokeWidth="1.6" fill="none" opacity={0.7} />
        </motion.svg>
      ))}

      {/* Viñeta suave para enfocar la mesa */}
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 120px rgba(140,100,60,0.18)" }} />
    </div>
  );
}
