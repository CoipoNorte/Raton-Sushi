/**
 * Ticket del pedido: la pieza de referencia GRANDE y nítida con
 * el mismo SushiRenderer que el plato (fidelidad total), sobre
 * una zona de exhibición clara con sombra suave.
 *
 * Todo el bloque se adapta con container queries a su columna
 * real, así las fichas y textos nunca se truncan: si no caben,
 * encogen o se reorganizan en vez de cortarse.
 */
import { motion } from "framer-motion";
import { Coins, Leaf, ReceiptText } from "lucide-react";
import { CATEGORY_META, INGREDIENTS_BY_ID } from "../game/ingredients";
import { pointsFor } from "../game/logic";
import type { Category, GameMode, Order } from "../game/types";
import { SushiRenderer } from "./sushi/SushiRenderer";

interface TicketCardProps {
  order: Order;
  multiplier: number;
  mode: GameMode;
  zenLevel: number;
  compact?: boolean;
}

const CAT_ORDER: Category[] = ["base", "protein", "sauce", "topping"];

function OrderChips({ order, dense = false }: { order: Order; dense?: boolean }) {
  const counts = new Map<string, number>();
  order.layers.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  const chips = CAT_ORDER.flatMap((cat) =>
    [...counts.entries()]
      .filter(([id]) => INGREDIENTS_BY_ID.get(id)?.category === cat)
      .map(([id, n]) => ({ def: INGREDIENTS_BY_ID.get(id)!, n }))
  );
  return (
    <div className={`flex flex-wrap gap-1 ${dense ? "" : "justify-start"}`}>
      {chips.map(({ def, n }) => (
        <span
          key={def.id}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#e8d8ba] bg-[#fffaf1] px-1.5 py-0.5 text-[10px] leading-none font-bold text-[#6b4a2f]"
          title={`${CATEGORY_META[def.category].label}: ${def.name}`}
        >
          <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: def.palette.main }} />
          <span className="truncate">{def.short}</span>
          {n > 1 && <b className="shrink-0 text-[#c07f3e]">×{n}</b>}
        </span>
      ))}
    </div>
  );
}

export function TicketCard({ order, multiplier, mode, zenLevel, compact = false }: TicketCardProps) {
  const isZen = mode === "zen";
  const reward = isZen ? 50 : pointsFor(order, multiplier);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5 text-[#a87f4c]">
        {isZen ? <Leaf size={13} strokeWidth={2.5} /> : <ReceiptText size={13} strokeWidth={2.5} />}
        <span className="truncate text-[10px] font-extrabold tracking-widest uppercase">
          {isZen ? `Nivel ${zenLevel}` : `Ticket #${order.seq}`}
        </span>
      </div>
      <span className="hidden truncate text-[11px] font-bold text-[#6b4a2f] @[180px]:inline">
        {order.customer}
      </span>
    </div>
  );

  const rewardRow = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 text-[#c07f3e]">
        <Coins size={13} strokeWidth={2.5} />
        <span className="text-xs font-extrabold">+{reward}¥</span>
      </div>
      {!isZen && multiplier > 1 && (
        <motion.span
          key={multiplier}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="shrink-0 rounded-full bg-gradient-to-r from-[#ffb36b] to-[#ff8f5c] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm"
        >
          ×{multiplier.toFixed(1)}
        </motion.span>
      )}
      {isZen && (
        <span className="shrink-0 rounded-full bg-[#cfe6b8] px-2 py-0.5 text-[10px] font-extrabold text-[#4a7340]">
          sin prisa
        </span>
      )}
    </div>
  );

  if (compact) {
    /* Móvil vertical: referencia a la izquierda, datos a la derecha */
    return (
      <motion.section
        key={order.seq}
        initial={{ opacity: 0.5, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="@container relative z-10 flex shrink-0 items-center gap-2 rounded-2xl border border-white/60 bg-white/60 p-2 shadow-[0_6px_18px_rgba(140,100,60,0.14)] backdrop-blur-md"
      >
        <div
          className="grid aspect-[5/4] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#fffaf1] p-1 shadow-[inset_0_2px_8px_rgba(200,160,110,0.25),0_3px_8px_rgba(140,100,60,0.18)]"
          style={{ height: "clamp(82px, 15vh, 142px)" }}
        >
          <SushiRenderer
            layers={order.layers}
            className="block h-full w-full drop-shadow-[0_4px_5px_rgba(120,85,50,0.3)]"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {header}
          <OrderChips order={order} dense />
          {rewardRow}
        </div>
      </motion.section>
    );
  }

  /* Tres columnas: referencia enorme ocupando el alto disponible */
  return (
    <motion.section
      key={order.seq}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="@container relative z-10 flex max-h-full min-h-0 flex-col gap-2 self-start overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-2.5 shadow-[0_8px_24px_rgba(140,100,60,0.16)] backdrop-blur-md"
    >
      {header}
      {/*
        Vitrina de referencia: caja con proporción fija (5/4) para
        que la pieza SIEMPRE llene el marco, sin cajas altísimas
        con un sushi diminuto en medio.
      */}
      <div className="grid aspect-[5/4] w-full shrink-0 place-items-center overflow-hidden rounded-xl bg-[#fffaf1] p-1.5 shadow-[inset_0_2px_10px_rgba(200,160,110,0.25),0_3px_8px_rgba(140,100,60,0.18)]">
        <SushiRenderer
          layers={order.layers}
          className="block h-full w-full drop-shadow-[0_6px_7px_rgba(120,85,50,0.3)]"
        />
      </div>
      <div className="nice-scroll max-h-[150px] min-h-0 shrink overflow-y-auto">
        <OrderChips order={order} />
      </div>
      {rewardRow}
    </motion.section>
  );
}
