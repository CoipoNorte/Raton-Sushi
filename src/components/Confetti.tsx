/**
 * Confetti temático de sushi bar: pétalos de gari, granitos de
 * arroz, matcha y oro. Se dispara con `burstKey` y se desmonta
 * solo. Física con spring de Framer Motion.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#ff9e7d", "#7fae7a", "#e8b04b", "#fbf4e6", "#f4b8c4", "#ffd35c"];

interface Petal {
  x: number;
  y: number;
  rot: number;
  size: number;
  color: string;
  dur: number;
  round: boolean;
}

export function Confetti({ burstKey }: { burstKey: number }) {
  const [visible, setVisible] = useState(false);

  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const angle = (i / 26) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 60 + Math.random() * 110;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.7 - 46,
          rot: Math.random() * 560 - 280,
          size: 6 + Math.random() * 7,
          color: COLORS[i % COLORS.length],
          dur: 0.9 + Math.random() * 0.5,
          round: i % 3 === 0,
        };
      }),
    // Se regenera en cada ráfaga
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey]
  );

  useEffect(() => {
    if (burstKey === 0) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(t);
  }, [burstKey]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" aria-hidden="true">
      {petals.map((p, i) => (
        <motion.div
          key={`${burstKey}-${i}`}
          className="absolute"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.55,
            borderRadius: p.round ? "50%" : "40%",
            background: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{ x: p.x, y: p.y + 70, opacity: [1, 1, 0], rotate: p.rot, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16, mass: 0.9, duration: p.dur }}
        />
      ))}
    </div>
  );
}
