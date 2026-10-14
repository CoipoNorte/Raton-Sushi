/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Motor de dibujo procedural del sushi (SVG)
 *
 *  Una misma lista de capas → la misma pieza SIEMPRE:
 *  el ticket del pedido y el plato real comparten este motor y un
 *  RNG determinista por (ingrediente, índice), así la referencia
 *  es fiel al 100 %. El viewBox se recorta justo al plato, sin
 *  decoración de fondo, para que la pieza llene su marco.
 *
 *  Geometría (viewBox 220×170):
 *    plato cerámica  → elipse (110,116) rx92 ry42
 *    montón de base  → centro (110,98)
 *    losa proteína k → cy = 84 − 11·(apilado)
 *    salsas/toppings → sobre la cima de la torre
 * ────────────────────────────────────────────────────────────────
 */
import { useId, type ReactElement } from "react";
import { motion } from "framer-motion";
import { INGREDIENTS_BY_ID } from "../../game/ingredients";
import { rngFor } from "../../game/logic";
import type { Palette } from "../../game/types";

export interface SushiRendererProps {
  /** Ids de ingrediente en orden de colocación. */
  layers: string[];
  /** Si true, la última capa entra con pop y la salsa se vierte. */
  animated?: boolean;
  /** Índice global de la capa recién colocada (para animarla). */
  popIndex?: number;
  /**
   * Alineación del dibujo dentro de su caja. En la mesa de juego
   * usamos "xMidYMax" para que el plato quede apoyado justo sobre
   * la cinta kaiten en vez de flotar en medio del hueco.
   */
  align?: "center" | "bottom";
  className?: string;
}

/* ─── Utilidades de trazado ───────────────────────────────────── */

interface GrainSpec {
  x: number;
  y: number;
  rot: number;
  rx: number;
}

/** Distribuye granos dentro de una elipse de forma orgánica. */
function grainLayout(rng: () => number, cx: number, cy: number, hw: number, hh: number, count: number): GrainSpec[] {
  const out: GrainSpec[] = [];
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng());
    out.push({
      x: cx + Math.cos(a) * hw * r,
      y: cy + Math.sin(a) * hh * r,
      rot: rng() * 70 - 35,
      rx: 5.4 + rng() * 1.8,
    });
  }
  return out;
}

function Grains({ specs, palette, seeded }: { specs: GrainSpec[]; palette: Palette; seeded: boolean }) {
  return (
    <g>
      {specs.map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${g.rot})`}>
          <ellipse rx={g.rx} ry={g.rx * 0.62} fill={i % 3 === 0 ? palette.light : palette.main} />
          <ellipse rx={g.rx} ry={g.rx * 0.62} fill="none" stroke={palette.dark} strokeWidth={0.5} opacity={0.35} />
          {seeded && i % 4 === 0 && <circle r={0.9} cx={1.2} cy={-0.6} fill="#f2e6cf" />}
        </g>
      ))}
    </g>
  );
}

/* ─── Bases ───────────────────────────────────────────────────── */

function BaseLayer({ id, palette, uid, rng }: { id: string; palette: Palette; uid: string; rng: () => number }) {
  const cx = 110;
  // Centro de la comida = centro visual del plato (antes quedaba
  // flotando en la mitad superior y el plato parecía vacío abajo)
  const cy = 116;

  if (id === "inari") {
    // Bolsita de tofu dorada, a escala del bocado (no del plato)
    return (
      <g>
        <ellipse cx={cx} cy={cy + 13} rx={38} ry={6} fill="#b99a6d" opacity={0.3} />
        <path
          d={`M ${cx - 38} ${cy + 11} Q ${cx - 41} ${cy - 8} ${cx - 22} ${cy - 14} Q ${cx} ${cy - 19} ${cx + 22} ${cy - 14} Q ${cx + 41} ${cy - 8} ${cx + 38} ${cy + 11} Q ${cx} ${cy + 19} ${cx - 38} ${cy + 11} Z`}
          fill={`url(#${uid}-inari)`}
        />
        <path d={`M ${cx - 25} ${cy + 6} Q ${cx} ${cy + 12} ${cx + 25} ${cy + 6}`} stroke={palette.dark} strokeWidth={1.8} fill="none" opacity={0.5} />
        <ellipse cx={cx} cy={cy - 13} rx={21} ry={6.4} fill={palette.dark} />
        <ellipse cx={cx} cy={cy - 14} rx={17.5} ry={5} fill="#fbf4e6" />
        {grainLayout(rng, cx, cy - 14, 13, 3.4, 6).map((g, i) => (
          <ellipse key={i} cx={g.x} cy={g.y} rx={2.8} ry={1.8} fill="#fffdf6" transform={`rotate(${g.rot} ${g.x} ${g.y})`} />
        ))}
        <path d={`M ${cx - 28} ${cy - 4} Q ${cx - 17} ${cy - 9} ${cx - 7} ${cy - 8}`} stroke={palette.light} strokeWidth={2.2} fill="none" opacity={0.8} strokeLinecap="round" />
      </g>
    );
  }

  if (id === "cucumber") {
    // Gunkan de pepino: anillo verde a escala del bocado
    return (
      <g>
        <ellipse cx={cx} cy={cy + 10} rx={42} ry={7} fill="#b99a6d" opacity={0.3} />
        <ellipse cx={cx} cy={cy + 5} rx={42} ry={11} fill={palette.dark} />
        <path
          d={`M ${cx - 42} ${cy + 2} v -17 a 42 14 0 0 1 84 0 v 17 a 42 11 0 0 1 -84 0 Z`}
          fill={palette.main}
        />
        <path
          d={`M ${cx - 31} ${cy - 12} v 15 M ${cx - 11} ${cy - 15} v 17 M ${cx + 11} ${cy - 15} v 17 M ${cx + 31} ${cy - 12} v 15`}
          stroke={palette.dark}
          strokeWidth={2.6}
          opacity={0.55}
          strokeLinecap="round"
        />
        <ellipse cx={cx} cy={cy - 15} rx={36} ry={12} fill={palette.light} />
        <ellipse cx={cx} cy={cy - 15} rx={29} ry={8.6} fill="#eaf4d8" />
        <Grains
          specs={grainLayout(rng, cx, cy - 15, 23, 6, 11)}
          palette={{ main: "#fbf4e6", light: "#fffdf6", dark: "#e6d5b6" }}
          seeded={false}
        />
      </g>
    );
  }

  // Shari / arroz negro / nori envuelta comparten montón de granos
  const seeded = id === "blackrice";
  const ricePalette: Palette =
    id === "noriwrap" ? { main: "#fbf4e6", light: "#fffdf6", dark: "#e6d5b6" } : palette;
  /*
   * Montón de arroz: primero un CUERPO sólido con forma de
   * almohadilla (el bocado de shari prensado) y encima los granos
   * como textura. Antes se dibujaban granos sueltos sobre el
   * plato y parecían guijarros desperdigados.
   */
  const bw = 46; // semiancho del montón
  const bh = 15; // semialto del montón
  return (
    <g>
      {/* sombra del bocado sobre la cerámica */}
      <ellipse cx={cx} cy={cy + bh - 1} rx={bw} ry={7} fill="#b99a6d" opacity={0.3} />
      {/* cuerpo prensado del arroz */}
      <path
        d={`M ${cx - bw} ${cy + bh - 5}
            q 0 -${bh * 2} ${bw * 0.42} -${bh * 2 - 1}
            q ${bw * 0.58} -4 ${bw * 1.16} 0
            q ${bw * 0.42} -1 ${bw * 0.42} ${bh * 2}
            q -${bw} 9 -${bw * 2} 0 Z`}
        fill={ricePalette.main}
        stroke={ricePalette.dark}
        strokeWidth={1.1}
      />
      {/* brillo superior del grano húmedo */}
      <ellipse cx={cx - bw * 0.18} cy={cy - bh * 0.55} rx={bw * 0.6} ry={bh * 0.36} fill={ricePalette.light} opacity={0.75} />
      {/* textura de granos, contenida dentro del montón */}
      <Grains specs={grainLayout(rng, cx, cy, bw - 9, bh - 4, 16)} palette={ricePalette} seeded={seeded} />
      {id === "noriwrap" && (
        <g>
          <path
            d={`M ${cx - 52} ${cy - 2} q 0 -12 14 -10 q 38 -6 76 0 q 14 -2 14 10 l 0 8 q -52 10 -104 0 Z`}
            fill={`url(#${uid}-nori)`}
          />
          <path d={`M ${cx - 40} ${cy - 6} q 20 -4 42 -2`} stroke={palette.light} strokeWidth={1.6} opacity={0.5} fill="none" />
        </g>
      )}
    </g>
  );
}

/* ─── Proteínas (losa nigiri) ─────────────────────────────────── */

function ProteinSlab({
  id,
  palette,
  uid,
  rng,
  cy,
}: {
  id: string;
  palette: Palette;
  uid: string;
  rng: () => number;
  cy: number;
}) {
  const cx = 110;
  const w = 88;
  const h = 26;
  const tilt = rng() * 4 - 2;
  const x = cx - w / 2;
  const y = cy - h / 2;

  const slab = (
    <rect x={x} y={y} width={w} height={h} rx={11} fill={`url(#${uid}-${id})`} />
  );

  let detail: ReactElement | null = null;
  if (id === "salmon") {
    detail = (
      <g stroke={palette.accent} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85}>
        <path d={`M ${x + 14} ${y + 4} q -4 ${h / 2} 2 ${h - 7}`} />
        <path d={`M ${cx - 4} ${y + 3} q -4 ${h / 2} 2 ${h - 6}`} />
        <path d={`M ${x + w - 20} ${y + 4} q -5 ${h / 2} 1 ${h - 7}`} />
      </g>
    );
  } else if (id === "tuna") {
    detail = (
      <g>
        <rect x={x + 3} y={y + h - 9} width={w - 6} height={7} rx={3.5} fill={palette.dark} opacity={0.45} />
        <ellipse cx={cx - 12} cy={y + 6} rx={24} ry={3.4} fill={palette.accent} opacity={0.5} />
      </g>
    );
  } else if (id === "butterfish") {
    // Pez mantequilla: nácar frío con reflejo y borde translúcido
    detail = (
      <g>
        <ellipse cx={cx - 8} cy={y + 6} rx={28} ry={4} fill="#ffffff" opacity={0.9} />
        <ellipse cx={cx + 20} cy={y + 9} rx={12} ry={2.4} fill="#ffffff" opacity={0.55} />
        <path d={`M ${x + 8} ${y + h - 7} h ${w - 16}`} stroke={palette.dark} strokeWidth={1.6} opacity={0.45} />
        <rect x={x} y={y} width={w} height={h} rx={11} fill="none" stroke={palette.dark} strokeWidth={1} opacity={0.5} />
      </g>
    );
  } else if (id === "shrimp") {
    // Langostino: segmentos curvos + cola en abanico (inconfundible)
    detail = (
      <g>
        <g stroke={palette.dark} strokeWidth={2.2} fill="none" opacity={0.55} strokeLinecap="round">
          <path d={`M ${x + 16} ${y + 2} q 5 ${h / 2} 0 ${h - 4}`} />
          <path d={`M ${x + 32} ${y + 1} q 5 ${h / 2} 0 ${h - 2}`} />
          <path d={`M ${x + 48} ${y + 1} q 5 ${h / 2} 0 ${h - 2}`} />
          <path d={`M ${x + 64} ${y + 2} q 5 ${h / 2} 0 ${h - 4}`} />
        </g>
        <path
          d={`M ${x + 10} ${y + 5} q ${w / 2} -6 ${w - 22} 1`}
          stroke={palette.light}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          opacity={0.8}
        />
        {/* cola en abanico, contenida dentro de la losa */}
        <path
          d={`M ${x + w - 18} ${cy} l 11 -7 l -2 7 l 2 7 Z`}
          fill={palette.dark}
          stroke={palette.light}
          strokeWidth={0.8}
          opacity={0.95}
        />
      </g>
    );
  } else if (id === "unagi") {
    // Unagi: marcas de parrilla cruzadas + lacado brillante
    detail = (
      <g>
        <g stroke="#2e1a0c" strokeWidth={2.6} opacity={0.45} strokeLinecap="round">
          <path d={`M ${x + 14} ${y + 3} l -5 ${h - 6}`} />
          <path d={`M ${x + 34} ${y + 3} l -5 ${h - 6}`} />
          <path d={`M ${x + 54} ${y + 3} l -5 ${h - 6}`} />
          <path d={`M ${x + 74} ${y + 3} l -5 ${h - 6}`} />
        </g>
        <path
          d={`M ${x + 8} ${y + 5} q ${w / 2 - 8} -7 ${w - 16} 0`}
          stroke={palette.accent}
          strokeWidth={3.4}
          fill="none"
          opacity={0.85}
          strokeLinecap="round"
        />
        <path
          d={`M ${x + 12} ${y + h - 4} q ${w / 2 - 12} 5 ${w - 24} 0`}
          stroke={palette.dark}
          strokeWidth={2}
          fill="none"
          opacity={0.6}
        />
      </g>
    );
  } else if (id === "tamago") {
    detail = (
      <g>
        <rect x={x + 4} y={y + h - 8} width={w - 8} height={6} rx={3} fill={palette.dark} opacity={0.55} />
        <g stroke={palette.dark} strokeWidth={1.6} opacity={0.5}>
          <path d={`M ${x + 10} ${y + 7} h ${w - 20}`} />
          <path d={`M ${x + 12} ${y + 12.5} h ${w - 24}`} />
        </g>
        <ellipse cx={cx - 14} cy={y + 5} rx={18} ry={2.8} fill={palette.accent} opacity={0.7} />
      </g>
    );
  }

  return (
    <g transform={`rotate(${tilt} ${cx} ${cy})`}>
      <rect x={x} y={y + 3} width={w} height={h} rx={11} fill="#000" opacity={0.08} />
      {slab}
      {detail}
    </g>
  );
}

/* ─── Salsas (hilo / drizzle) ─────────────────────────────────── */

/** Grosor y textura propios de cada salsa (identificables a ojo). */
const SAUCE_STYLE: Record<string, { w: number; dash?: string; blobs?: boolean }> = {
  soy: { w: 2.8 }, // hilo líquido finito
  sriracha: { w: 6.2, blobs: true }, // crema espesa con picante
  unagisauce: { w: 5.4 }, // cinta lacada brillante
  avocado: { w: 6.8 }, // crema densa
  wasabi: { w: 4.2, dash: "7 5" }, // toques entrecortados
};

function SauceDrizzle({
  id,
  palette,
  rng,
  topY,
  animated,
}: {
  id: string;
  palette: Palette;
  rng: () => number;
  topY: number;
  animated: boolean;
}) {
  const style = SAUCE_STYLE[id] ?? { w: 4.4 };
  const pts: string[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = 66 + (i * 88) / (n - 1);
    // Amplitud contenida: la salsa REPOSA sobre la pieza, no flota
    const y = topY + (i % 2 === 0 ? -3.5 : 3.5) + (rng() * 2.4 - 1.2);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const d = pts.join(" ");
  const gloss = pts
    .map((p, i) => {
      const [, x, y] = p.split(" ");
      return `${i === 0 ? "M" : "L"} ${x} ${(parseFloat(y) - 2.2).toFixed(1)}`;
    })
    .join(" ");

  const PathComp = animated ? motion.path : "path";
  const animProps = animated
    ? {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: 0.45, ease: "easeInOut" as const },
      }
    : {};

  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* sombra proyectada del hilo */}
      <PathComp
        d={d}
        stroke={palette.dark}
        strokeWidth={style.w + 1.2}
        opacity={0.35}
        transform="translate(0 1.4)"
        strokeDasharray={style.dash}
      />
      {/* cuerpo de la salsa, con su grosor característico */}
      <PathComp d={d} stroke={palette.main} strokeWidth={style.w} strokeDasharray={style.dash} {...animProps} />
      {/* brillo del glaseado */}
      <path
        d={gloss}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={Math.max(1, style.w * 0.34)}
        strokeDasharray={style.dash}
      />
      {/* motitas picantes de la sriracha */}
      {style.blobs && (
        <g fill={palette.dark} stroke="none" opacity={0.75}>
          {[0, 1, 2, 3].map((k) => (
            <circle key={k} cx={74 + k * 24 + rng() * 6} cy={topY + (k % 2 ? 5 : -5)} r={1.6} />
          ))}
        </g>
      )}
    </g>
  );
}

/* ─── Toppings (partículas) ───────────────────────────────────── */

function ToppingScatter({
  id,
  palette,
  rng,
  topY,
}: {
  id: string;
  palette: Palette;
  rng: () => number;
  topY: number;
}) {
  const items: ReactElement[] = [];
  const px = () => 74 + rng() * 72;
  // Los toppings descansan sobre la cara superior de la pieza
  const py = () => topY - 1 + rng() * 10;

  if (id === "tobiko" || id === "vegcaviar") {
    const count = id === "tobiko" ? 12 : 9;
    for (let i = 0; i < count; i++) {
      const x = px();
      const y = py();
      const r = 2.4 + rng() * 0.9;
      items.push(
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={i % 2 ? palette.main : palette.light} />
          <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.32} fill="#fff" opacity={0.85} />
        </g>
      );
    }
  } else if (id === "sesame") {
    for (let i = 0; i < 16; i++) {
      const x = px();
      const y = py();
      const rot = rng() * 180;
      items.push(
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={2.3}
          ry={1.4}
          fill={i % 2 === 0 ? palette.light : palette.dark}
          transform={`rotate(${rot} ${x} ${y})`}
        />
      );
    }
  } else if (id === "scallion") {
    // Cebollín: aros huecos (tubo cortado), no simples barritas
    for (let i = 0; i < 11; i++) {
      const x = px();
      const y = py();
      const r = 2.6 + rng() * 0.8;
      items.push(
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={i % 2 ? palette.main : palette.light} />
          <circle cx={x} cy={y} r={r * 0.42} fill="#f3fbe9" />
          <circle cx={x} cy={y} r={r} fill="none" stroke={palette.dark} strokeWidth={0.6} opacity={0.7} />
        </g>
      );
    }
  } else if (id === "noristrips") {
    for (let i = 0; i < 6; i++) {
      const x = px();
      const y = py();
      const rot = rng() * 70 - 35;
      items.push(
        <rect
          key={i}
          x={x - 8}
          y={y - 1.6}
          width={16}
          height={3.2}
          rx={1.2}
          fill={palette.main}
          stroke={palette.light}
          strokeWidth={0.5}
          opacity={0.95}
          transform={`rotate(${rot} ${x} ${y})`}
        />
      );
    }
  } else if (id === "gari") {
    for (let i = 0; i < 4; i++) {
      const x = px();
      const y = py() - 1;
      const rot = rng() * 40 - 20;
      items.push(
        <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
          <path
            d={`M ${x} ${y} q 7 -6 13 -2 q 2 6 -4 9 q -9 2 -9 -7 Z`}
            fill={palette.main}
            stroke={palette.dark}
            strokeWidth={0.7}
            opacity={0.96}
          />
          <path d={`M ${x + 2} ${y} q 5 -3 9 -1`} stroke={palette.light} strokeWidth={1.1} fill="none" />
        </g>
      );
    }
  }
  return <g>{items}</g>;
}

/* ─── Componente principal ────────────────────────────────────── */

export function SushiRenderer({
  layers,
  animated = false,
  popIndex = -1,
  align = "center",
  className,
}: SushiRendererProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  // Agrupar por categoría conservando el índice global (para el pop)
  const byCat: Record<string, number[]> = { base: [], protein: [], sauce: [], topping: [] };
  layers.forEach((id, i) => {
    const cat = INGREDIENTS_BY_ID.get(id)?.category;
    if (cat) byCat[cat].push(i);
  });

  const defOf = (i: number) => INGREDIENTS_BY_ID.get(layers[i]);

  const pCount = byCat.protein.length;
  /*
   * Cara superior real de la torre: salsas y toppings se apoyan
   * justo ahí (antes quedaban flotando por encima de la pieza).
   * Con proteína → borde alto de la losa más elevada; sin ella →
   * cresta del montón de arroz.
   */
  const stackTopY = pCount > 0 ? 104 - (pCount - 1) * 11 - 9 : 98;

  /*
   * Encuadre dinámico: recortamos el viewBox justo alrededor del
   * contenido real (plato + torre de capas) para que la pieza
   * LLENE el marco tanto si es un nigiri simple como una torre de
   * 8 capas, sin franjas muertas arriba. El borde inferior del
   * plato está en y≈158; el superior del plato, en y≈74.
   */
  const contentTop = (() => {
    let top = 84; // borde superior del plato de cerámica
    if (pCount > 0) top = Math.min(top, 104 - (pCount - 1) * 11 - 16);
    if (byCat.base.length > 0) {
      const baseId = layers[byCat.base[0]];
      if (baseId === "cucumber") top = Math.min(top, 78);
      else if (baseId === "inari") top = Math.min(top, 86);
    }
    if (byCat.sauce.length > 0) top = Math.min(top, stackTopY - 10);
    if (byCat.topping.length > 0) top = Math.min(top, stackTopY - 18);
    return Math.max(0, top - 6); // respiro superior
  })();
  const viewBox = `34 ${contentTop} 152 ${152 - contentTop}`;
  /** Proporción real del encuadre: evita cajas con aire muerto. */
  const aspect = `152 / ${152 - contentTop}`;

  /** Envuelve la última capa con un "pop" de caída suave. */
  const wrap = (i: number, node: ReactElement): ReactElement => {
    if (animated && i === popIndex) {
      return (
        <motion.g
          key={`pop-${i}`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 22 }}
        >
          {node}
        </motion.g>
      );
    }
    return <g key={`l-${i}`}>{node}</g>;
  };

  const grad = (id: string, palette: Palette, vertical = true) => (
    <linearGradient key={id} id={`${uid}-${id}`} x1="0" y1="0" x2={vertical ? "0" : "1"} y2={vertical ? "1" : "0"}>
      <stop offset="0" stopColor={palette.light} />
      <stop offset="0.55" stopColor={palette.main} />
      <stop offset="1" stopColor={palette.dark} />
    </linearGradient>
  );

  // Gradientes necesarios según las capas presentes
  const needed = new Set(byCat.protein.map((i) => layers[i]));

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={align === "bottom" ? "xMidYMax meet" : "xMidYMid meet"}
      style={align === "bottom" ? { aspectRatio: aspect } : undefined}
      className={className}
      role="img"
      aria-label="Pieza de sushi"
    >
      <defs>
        <radialGradient id={`${uid}-plate`} cx="0.5" cy="0.35" r="0.9">
          <stop offset="0" stopColor="#fffaf1" />
          <stop offset="0.75" stopColor="#f4e7d0" />
          <stop offset="1" stopColor="#e3cfae" />
        </radialGradient>
        <linearGradient id={`${uid}-nori`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5639" />
          <stop offset="1" stopColor="#242c1e" />
        </linearGradient>
        <linearGradient id={`${uid}-inari`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2c078" />
          <stop offset="1" stopColor="#a86f2e" />
        </linearGradient>
        {[...needed].map((pid) => {
          const p = INGREDIENTS_BY_ID.get(pid);
          return p ? grad(pid, p.palette) : null;
        })}
      </defs>

      {/* Plato de cerámica (sombras sutiles, nada de fondo extra) */}
      <ellipse cx="111" cy="126" rx="66" ry="19" fill="#8a6f4d" opacity={0.18} />
      <ellipse cx="110" cy="116" rx="70" ry="32" fill={`url(#${uid}-plate)`} />
      <ellipse cx="110" cy="116" rx="70" ry="32" fill="none" stroke="#d9c198" strokeWidth="2.5" />
      <ellipse cx="110" cy="112" rx="56" ry="23" fill="#efdfc2" opacity={0.85} />
      <ellipse cx="110" cy="112" rx="56" ry="23" fill="none" stroke="#dcc7a0" strokeWidth="1.4" />

      {/* Base */}
      {byCat.base.map((i) => {
        const d = defOf(i);
        if (!d) return null;
        return wrap(i, <BaseLayer id={d.id} palette={d.palette} uid={uid} rng={rngFor(`${d.id}:${i}`)} />);
      })}

      {/* Proteínas apiladas */}
      {byCat.protein.map((i, k) => {
        const d = defOf(i);
        if (!d) return null;
        /* La primera losa va abajo y las siguientes se apilan
           encima: así el orden de pintado coincide con la altura
           (antes la de arriba quedaba tapada por la de abajo). */
        const cy = 104 - k * 11;
        return wrap(i, <ProteinSlab id={d.id} palette={d.palette} uid={uid} rng={rngFor(`${d.id}:${i}`)} cy={cy} />);
      })}

      {/* Salsas cruzadas sobre la cima */}
      {byCat.sauce.map((i) => {
        const d = defOf(i);
        if (!d) return null;
        return wrap(
          i,
          <SauceDrizzle
            id={d.id}
            palette={d.palette}
            rng={rngFor(`${d.id}:${i}`)}
            topY={stackTopY}
            animated={animated && i === popIndex}
          />
        );
      })}

      {/* Toppings (admite ×2 con semillas distintas por índice) */}
      {byCat.topping.map((i) => {
        const d = defOf(i);
        if (!d) return null;
        return wrap(i, <ToppingScatter id={d.id} palette={d.palette} rng={rngFor(`${d.id}:${i}`)} topY={stackTopY} />);
      })}
    </svg>
  );
}
