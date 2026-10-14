/**
 * ────────────────────────────────────────────────────────────────
 *  Barra de trabajo · vitrina kaiten de ingredientes
 *
 *  Tres formas de interactuar, conviviendo sin pisarse:
 *   · TOCAR una ficha → añade la capa con pop.
 *   · ARRASTRAR a lo largo de la cinta → desplaza el menú
 *     (nativo con inercia en táctil; manual con momentum en ratón).
 *   · ARRASTRAR PERPENDICULAR hacia el plato → la ficha viaja con
 *     el dedo y se suelta sobre la zona del plato para colocarla.
 *
 *  Además la cinta se AUTO-DESPLAZA en bucle lento (como un kaiten
 *  real) cuando está inactiva, y se pausa al interactuar.
 * ────────────────────────────────────────────────────────────────
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Droplets, Fish, Sparkles, Wheat } from "lucide-react";
import { CATEGORY_CAPS } from "../game/constants";
import { CATEGORY_META, INGREDIENTS_BY_CATEGORY, INGREDIENTS_BY_ID } from "../game/ingredients";
import { isCategoryComplete, nextPendingCategory } from "../game/logic";
import type { Category, IngredientDef } from "../game/types";
import { IngredientIcon } from "./IngredientIcon";

interface IngredientBarProps {
  plate: string[];
  /** Capas que pide el ticket (para saber qué sección está lista). */
  target: string[];
  onAdd: (id: string) => void;
  isPortrait: boolean;
  /** Saltar de pestaña al completar una sección del pedido. */
  autoAdvance: boolean;
  /**
   * Cambia con cada pedido nuevo (nº de ticket). Al servir, la
   * vitrina vuelve sola a «Base» para empezar la siguiente pieza
   * desde el principio, sin tener que buscar la pestaña.
   */
  orderKey: number;
}

const TABS: { cat: Category; Icon: typeof Wheat }[] = [
  { cat: "base", Icon: Wheat },
  { cat: "protein", Icon: Fish },
  { cat: "sauce", Icon: Droplets },
  { cat: "topping", Icon: Sparkles },
];

/** Umbral en px para distinguir toque de arrastre. */
const DRAG_THRESHOLD = 7;
/** Velocidad del auto-desplazamiento (px por frame). */
const AUTO_SPEED = 0.5;

interface DragState {
  pointerId: number;
  pointerType: string;
  chipId: string | null;
  startX: number;
  startY: number;
  startScroll: number;
  mode: "pending" | "scroll" | "chip" | "native";
  axisLast: number;
  timeLast: number;
  velocity: number; // px/ms en el eje principal
}

export function IngredientBar({
  plate,
  target,
  onAdd,
  isPortrait,
  autoAdvance,
  orderKey,
}: IngredientBarProps) {
  const [active, setActive] = useState<Category>("base");
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null);

  const stripRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<DragState | null>(null);
  const suppressClickUntil = useRef(0);
  const autoPauseUntil = useRef(0);
  const autoDir = useRef(1);
  const momentumRaf = useRef(0);
  const hoverRef = useRef(false);

  const pauseAuto = useCallback((ms = 4000) => {
    autoPauseUntil.current = performance.now() + ms;
  }, []);

  /* ─── Auto-desplazamiento kaiten (ping-pong, con pausas) ────── */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const step = () => {
      const el = stripRef.current;
      if (el && !drag.current && !hoverRef.current && performance.now() > autoPauseUntil.current) {
        if (isPortrait) {
          const max = el.scrollWidth - el.clientWidth;
          if (max > 8) {
            el.scrollLeft += AUTO_SPEED * autoDir.current;
            if (el.scrollLeft >= max - 1) autoDir.current = -1;
            else if (el.scrollLeft <= 1) autoDir.current = 1;
          }
        } else {
          const max = el.scrollHeight - el.clientHeight;
          if (max > 8) {
            el.scrollTop += AUTO_SPEED * autoDir.current;
            if (el.scrollTop >= max - 1) autoDir.current = -1;
            else if (el.scrollTop <= 1) autoDir.current = 1;
          }
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPortrait]);

  /* ─── Rueda del ratón → scroll lateral en vertical ──────────── */
  useEffect(() => {
    const el = stripRef.current;
    if (!el || !isPortrait) return;
    const onWheel = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
        ev.preventDefault();
        el.scrollLeft += ev.deltaY;
        pauseAuto(2800);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isPortrait, pauseAuto]);

  /* ─── Momentum al soltar un arrastre de ratón ───────────────── */
  const startMomentum = useCallback(() => {
    cancelAnimationFrame(momentumRaf.current);
    let v = (drag.current?.velocity ?? 0) * 16; // px por frame
    const step = () => {
      const el = stripRef.current;
      if (!el || Math.abs(v) < 0.35) return;
      if (isPortrait) el.scrollLeft -= v;
      else el.scrollTop -= v;
      v *= 0.92;
      momentumRaf.current = requestAnimationFrame(step);
    };
    momentumRaf.current = requestAnimationFrame(step);
  }, [isPortrait]);

  /* ─── Arrastre: scroll, ficha fantasma o desplazamiento nativo ── */
  const endDrag = useCallback(
    (e: PointerEvent, cancelled: boolean) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);

      if (d.mode === "chip") {
        setGhost(null);
        window.dispatchEvent(new CustomEvent("sushi:chip-drag", { detail: { active: false } }));
        suppressClickUntil.current = performance.now() + 180;
        if (!cancelled && d.chipId) {
          const hit = document.elementFromPoint(e.clientX, e.clientY);
          if (hit && (hit as HTMLElement).closest("[data-dropzone]")) {
            onAdd(d.chipId);
          }
        }
      } else if (d.mode === "scroll") {
        suppressClickUntil.current = performance.now() + 120;
        if (!cancelled) startMomentum();
      }
      pauseAuto(2600);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onAdd, pauseAuto, startMomentum]
  );

  const onMove = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      const el = stripRef.current;
      if (!d || !el || e.pointerId !== d.pointerId) return;

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const main = isPortrait ? dx : dy;
      const cross = isPortrait ? dy : dx;

      if (d.mode === "pending") {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        if (Math.abs(cross) > Math.abs(main) * 1.1 && d.chipId) {
          // Arrastre perpendicular: la ficha sale de la cinta
          d.mode = "chip";
          setGhost({ id: d.chipId, x: e.clientX, y: e.clientY });
          window.dispatchEvent(new CustomEvent("sushi:chip-drag", { detail: { active: true } }));
        } else if (d.pointerType === "touch") {
          d.mode = "native"; // el navegador scrollea con inercia
        } else {
          d.mode = "scroll"; // ratón: arrastre manual + momentum
        }
      }

      if (d.mode === "chip" && d.chipId) {
        setGhost({ id: d.chipId, x: e.clientX, y: e.clientY });
        return;
      }

      if (d.mode === "scroll") {
        if (isPortrait) el.scrollLeft = d.startScroll - dx;
        else el.scrollTop = d.startScroll - dy;
        const now = performance.now();
        const axisNow = isPortrait ? e.clientX : e.clientY;
        const dt = Math.max(1, now - d.timeLast);
        d.velocity = (axisNow - d.axisLast) / dt;
        d.axisLast = axisNow;
        d.timeLast = now;
      }
    },
    [isPortrait]
  );

  const onUp = useCallback((e: PointerEvent) => endDrag(e, false), [endDrag]);
  const onCancel = useCallback((e: PointerEvent) => endDrag(e, true), [endDrag]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.isPrimary) return;
      cancelAnimationFrame(momentumRaf.current);
      const chip = (e.target as HTMLElement).closest("[data-ing]") as HTMLElement | null;
      const el = stripRef.current;
      drag.current = {
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        chipId: chip?.dataset.ing ?? null,
        startX: e.clientX,
        startY: e.clientY,
        startScroll: el ? (isPortrait ? el.scrollLeft : el.scrollTop) : 0,
        mode: "pending",
        axisLast: isPortrait ? e.clientX : e.clientY,
        timeLast: performance.now(),
        velocity: 0,
      };
      pauseAuto(4000);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    },
    [isPortrait, pauseAuto, onMove, onUp, onCancel]
  );

  /* Limpieza al desmontar: rafs, listeners y fantasma */
  useEffect(
    () => () => {
      cancelAnimationFrame(momentumRaf.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    },
    [onMove, onUp, onCancel]
  );

  /* Al cambiar de pestaña, vuelve al inicio de la cinta */
  const selectTab = useCallback(
    (cat: Category) => {
      setActive(cat);
      const el = stripRef.current;
      if (el) {
        if (isPortrait) el.scrollTo({ left: 0, behavior: "smooth" });
        else el.scrollTo({ top: 0, behavior: "smooth" });
      }
      pauseAuto(2200);
    },
    [isPortrait, pauseAuto]
  );

  /*
   * ─── Auto-avance de pestañas ──────────────────────────────────
   * Al añadir una capa, si el plato ya cubre EXACTAMENTE lo que el
   * ticket pide de la categoría abierta, saltamos a la siguiente
   * sección pendiente. Si no queda ninguna, nos quedamos donde
   * estamos (es el momento de SERVIR).
   *
   * Importante: solo reacciona a cambios del PLATO. Si el jugador
   * elige una pestaña a mano, jamás se le expulsa de ella (antes,
   * abrir una categoría que el ticket no pedía rebotaba sola).
   */
  /*
   * Pedido servido → vuelta a «Base». El ticket nuevo siempre
   * empieza por el arroz, así que dejamos la vitrina lista en la
   * primera sección en lugar de donde quedó la pieza anterior.
   */
  const firstOrderRef = useRef(orderKey);
  useEffect(() => {
    if (orderKey === firstOrderRef.current) return; // montaje inicial
    selectTab("base");
  }, [orderKey, selectTab]);

  const lastPlateRef = useRef<string>(plate.join("|"));
  useEffect(() => {
    const sig = plate.join("|");
    const plateChanged = sig !== lastPlateRef.current;
    lastPlateRef.current = sig;

    if (!plateChanged || !autoAdvance) return;
    if (plate.length === 0 || target.length === 0) return; // plato limpio: sin saltos
    if (!isCategoryComplete(plate, target, active)) return;

    const next = nextPendingCategory(plate, target, active);
    if (!next || next === active) return;

    /* Sin cartel: el propio salto de pestaña + la ✅ de la sección
       terminada ya comunican lo que ha pasado, y así nada compite
       con el botón SERVIR. */
    const t = window.setTimeout(() => selectTab(next), 340);
    return () => window.clearTimeout(t);
  }, [plate, target, active, autoAdvance, selectTab]);

  /** ¿Esta categoría ya está resuelta según el ticket? */
  const catDone = (cat: Category) =>
    target.some((id) => INGREDIENTS_BY_ID.get(id)?.category === cat) &&
    isCategoryComplete(plate, target, cat);

  const countInCat = (cat: Category) => plate.filter((id) => INGREDIENTS_BY_ID.get(id)?.category === cat).length;
  const countOf = (id: string) => plate.filter((x) => x === id).length;

  const renderChip = (def: IngredientDef) => {
    const cap = CATEGORY_CAPS[def.category];
    const full = def.category !== "base" && countInCat(def.category) >= cap;
    const owned = countOf(def.id);
    return (
      <motion.button
        key={`${active}-${def.id}`}
        type="button"
        data-ing={def.id}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => {
          if (performance.now() < suppressClickUntil.current) return;
          if (!full) onAdd(def.id);
        }}
        aria-disabled={full}
        title={def.blurb}
        className={`relative flex shrink-0 snap-start items-center rounded-2xl border transition-colors ${
          isPortrait
            ? "w-[70px] flex-col gap-0.5 p-1.5"
            : "w-full flex-col gap-0.5 p-1.5 @[250px]:flex-row @[250px]:gap-2 @[250px]:px-2 @[250px]:py-2"
        } ${
          full
            ? "border-[#e3d2b2] bg-[#efe3cb] opacity-40"
            : "border-[#eadbbec0] bg-[#fffaf1]/90 shadow-[0_2px_6px_rgba(140,100,60,0.14)] active:bg-[#ffefd2]"
        }`}
      >
        <span className="shrink-0">
          <IngredientIcon def={def} size={isPortrait ? 34 : 34} />
        </span>
        <span
          className={`min-w-0 font-bold text-[#6b4a2f] ${
            isPortrait
              ? "w-full truncate text-center text-[9px] leading-tight"
              : "w-full truncate text-center text-[10px] leading-tight @[250px]:text-left @[250px]:text-[11.5px]"
          }`}
        >
          {def.short}
        </span>
        {owned > 0 && (
          <motion.span
            key={owned}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
            className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#ef7f5a] px-1 text-[9px] font-extrabold text-white shadow"
          >
            {owned}
          </motion.span>
        )}
      </motion.button>
    );
  };

  const ghostDef = ghost ? INGREDIENTS_BY_ID.get(ghost.id) : undefined;

  return (
    <div className={`@container flex ${isPortrait ? "flex-col gap-1" : "max-h-full min-h-0 flex-col gap-1.5"}`}>
      {/*
        Pestañas: el icono SIEMPRE se ve y la etiqueta aparece solo
        cuando el contenedor tiene sitio real (container query), así
        nunca se corta en "Base, Pescao, Sals…". Bajo ese umbral,
        la categoría activa muestra su nombre en una línea aparte.
      */}
      <div className="relative flex gap-1 px-0.5" role="tablist" aria-label="Categorías de ingredientes">
        {TABS.map(({ cat, Icon }) => {
          const isActive = active === cat;
          return (
            <motion.button
              key={cat}
              role="tab"
              aria-selected={isActive}
              aria-label={CATEGORY_META[cat].full}
              title={CATEGORY_META[cat].full}
              whileTap={{ scale: 0.92 }}
              onClick={() => selectTab(cat)}
              className={`relative flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-extrabold transition-colors @[305px]:gap-1.5 @[305px]:px-2 ${
                isActive ? "text-[#4c3520]" : "text-[#a98d68] hover:text-[#6b4a2f]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={`tab-${isPortrait ? "p" : "l"}`}
                  className="absolute inset-0 rounded-xl border border-[#e8d8ba] bg-white/80 shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <Icon
                size={16}
                strokeWidth={2.7}
                className="relative z-10 shrink-0"
                style={{ color: CATEGORY_META[cat].tint }}
              />
              <span className="relative z-10 hidden whitespace-nowrap @[305px]:inline">{CATEGORY_META[cat].label}</span>

              {/* Palomita: esta sección ya coincide con el ticket */}
              {catDone(cat) && (
                <motion.span
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                  className="absolute -top-1 -right-0.5 z-20 grid size-4 place-items-center rounded-full bg-[#5f8f5b] text-white shadow"
                >
                  <Check className="size-3" strokeWidth={4} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Nombre de la categoría activa cuando no caben las etiquetas */}
      <div className="truncate px-1 text-center text-[10px] font-extrabold tracking-wide text-[#a87f4c] uppercase @[305px]:hidden">
        {CATEGORY_META[active].label}
      </div>

      {/* Cinta kaiten: arrastrable, auto-desplazante, con fundidos */}
      <div
        className="relative min-h-0 flex-1"
        onPointerEnter={() => {
          hoverRef.current = true;
        }}
        onPointerLeave={() => {
          hoverRef.current = false;
        }}
      >
        <div
          ref={stripRef}
          onPointerDown={onPointerDown}
          className={`nice-scroll ${
            isPortrait
              ? "flex snap-x snap-proximity gap-1.5 overflow-x-auto px-2 py-1.5"
              : "grid snap-y snap-proximity grid-cols-2 content-start gap-1.5 overflow-y-auto px-1 py-1.5 @[250px]:grid-cols-1"
          }`}
          style={{ touchAction: isPortrait ? "pan-x" : "pan-y" }}
        >
          {INGREDIENTS_BY_CATEGORY[active].map(renderChip)}
          <div className={`shrink-0 ${isPortrait ? "w-2" : "h-2"}`} />
        </div>

        {/* Fundidos que sugieren scroll */}
        {isPortrait ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-5 rounded-l-xl bg-gradient-to-r from-white/70 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-5 rounded-r-xl bg-gradient-to-l from-white/70 to-transparent" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-5 rounded-t-xl bg-gradient-to-b from-white/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 rounded-b-xl bg-gradient-to-t from-white/70 to-transparent" />
          </>
        )}
      </div>

      {/* Ficha fantasma que sigue al dedo/ratón hasta el plato */}
      {ghost && ghostDef && (
        <div
          className="pointer-events-none fixed z-[60] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-[#ef7f5a] bg-white/95 shadow-[0_10px_24px_rgba(140,100,60,0.35)]"
          >
            <IngredientIcon def={ghostDef} size={38} />
          </motion.div>
          <span className="mt-1 rounded-full bg-[#4c3520] px-2 py-0.5 text-[9px] font-extrabold whitespace-nowrap text-[#ffefd2] shadow">
            {ghostDef.short} → plato
          </span>
        </div>
      )}
    </div>
  );
}
