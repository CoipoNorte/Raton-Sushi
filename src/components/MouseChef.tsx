/**
 * ────────────────────────────────────────────────────────────────
 *  Ratoncito itamae · Mascota protagonista (100 % SVG)
 *  Lleva hachimaki con hinomaru y delantal. Reacciona en vivo:
 *  parpadea, respira, celebra el pedido perfecto y se preocupa
 *  cuando fallas o el tiempo aprieta.
 * ────────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Mood } from "../game/types";

export interface MouseChefProps {
  mood?: Mood;
  size?: number;
  className?: string;
}

export function MouseChef({ mood = "idle", size = 140, className }: MouseChefProps) {
  const [blink, setBlink] = useState(false);

  // Parpadeo orgánico a intervalos irregulares
  useEffect(() => {
    let alive = true;
    let t1 = 0;
    let t2 = 0;
    const loop = () => {
      t1 = window.setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        t2 = window.setTimeout(() => {
          if (!alive) return;
          setBlink(false);
          loop();
        }, 130);
      }, 1800 + Math.random() * 2600);
    };
    loop();
    return () => {
      alive = false;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const celebrating = mood === "celebrate" || mood === "happy";
  const worried = mood === "worried";
  const eyesClosed = blink || celebrating;

  return (
    <motion.svg
      viewBox="0 0 200 212"
      width={size}
      height={size * 1.06}
      className={className}
      role="img"
      aria-label="Ratoncito chef itamae"
      animate={
        celebrating
          ? { y: [0, -14, 0], rotate: [0, -3, 3, 0] }
          : worried
            ? { x: [0, -2, 2, -1, 1, 0] }
            : { y: [0, -3, 0] }
      }
      transition={
        celebrating
          ? { duration: 0.55, repeat: 2, ease: "easeOut" }
          : worried
            ? { duration: 0.5 }
            : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* Orejas */}
      <circle cx="52" cy="46" r="27" fill="#b9ada0" />
      <circle cx="52" cy="46" r="15" fill="#efc4bb" />
      <circle cx="148" cy="46" r="27" fill="#b9ada0" />
      <circle cx="148" cy="46" r="15" fill="#efc4bb" />

      {/* Cabeza */}
      <ellipse cx="100" cy="106" rx="66" ry="60" fill="#c9beb1" />
      <ellipse cx="100" cy="122" rx="47" ry="40" fill="#efe6d8" />
      <ellipse cx="72" cy="128" rx="9" ry="6" fill="#f2ccc4" opacity={0.7} />
      <ellipse cx="128" cy="128" rx="9" ry="6" fill="#f2ccc4" opacity={0.7} />

      {/* Hachimaki con hinomaru y nudo */}
      <path d="M36 70 q64 -26 128 0 l0 22 q-64 -18 -128 0 Z" fill="#fbf6ee" />
      <path d="M36 70 q64 -26 128 0 l0 6 q-64 -22 -128 0 Z" fill="#e9ddca" opacity="0.7" />
      <circle cx="100" cy="72" r="10" fill="#e5484d" />
      <path d="M158 66 l22 -10 -5 18 -19 2 Z" fill="#fbf6ee" />
      <path d="M159 78 l24 5 -11 13 -16 -8 Z" fill="#efe4d2" />

      {/* Cejas (preocupado) */}
      {worried && (
        <g stroke="#6b5d4f" strokeWidth="3" strokeLinecap="round">
          <path d="M66 98 q10 -5 20 -2" />
          <path d="M134 98 q-10 -5 -20 -2" />
        </g>
      )}

      {/* Ojos con parpadeo */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={{ scaleY: eyesClosed ? 0.12 : 1 }}
        transition={{ duration: 0.09 }}
      >
        {worried ? (
          <g fill="#3a322b">
            <ellipse cx="78" cy="110" rx="6" ry="7.5" />
            <ellipse cx="122" cy="110" rx="6" ry="7.5" />
            <circle cx="80" cy="107.5" r="2" fill="#fff" />
            <circle cx="124" cy="107.5" r="2" fill="#fff" />
          </g>
        ) : (
          <g fill="#3a322b">
            <ellipse cx="78" cy="110" rx="6.4" ry="8" />
            <ellipse cx="122" cy="110" rx="6.4" ry="8" />
            <circle cx="80.4" cy="107" r="2.2" fill="#fff" />
            <circle cx="124.4" cy="107" r="2.2" fill="#fff" />
          </g>
        )}
      </motion.g>

      {/* Nariz + boca según ánimo */}
      <path d="M100 124 l-5.5 5 q5.5 6 11 0 Z" fill="#e88f8f" />
      {celebrating ? (
        <path d="M86 136 q14 14 28 0 q-2 14 -14 14 q-12 0 -14 -14 Z" fill="#a85b47" />
      ) : worried ? (
        <path d="M88 141 q12 -7 24 0" stroke="#8a6f5c" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M88 137 q12 9 24 0" stroke="#8a6f5c" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}

      {/* Bigotes */}
      <g stroke="#8a7a68" strokeWidth="1.8" strokeLinecap="round" opacity="0.8">
        <line x1="28" y1="116" x2="54" y2="121" />
        <line x1="28" y1="128" x2="54" y2="126" />
        <line x1="172" y1="116" x2="146" y2="121" />
        <line x1="172" y1="128" x2="146" y2="126" />
      </g>

      {/* Gota de sudor al preocuparse */}
      {worried && (
        <motion.path
          d="M156 82 q7 10 7 14 a7 7 0 1 1 -14 0 q0 -4 7 -14 Z"
          fill="#a9d8f0"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        />
      )}

      {/* Chispitas de celebración */}
      {celebrating && (
        <g fill="#e8b04b">
          <motion.path d="M40 60 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          <motion.path d="M164 44 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 Z" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        </g>
      )}

      {/* Delantal tradicional */}
      <g>
        <path d="M70 158 q30 -10 60 0 l4 34 q-34 10 -68 0 Z" fill="#41597f" />
        <path d="M78 156 l-6 14 M122 156 l6 14" stroke="#2f4463" strokeWidth="3" />
        <circle cx="100" cy="178" r="7.5" fill="#e8b04b" />
        <path d="M84 190 h32" stroke="#ccd7ea" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </g>
    </motion.svg>
  );
}
