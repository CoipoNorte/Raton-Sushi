/**
 * ────────────────────────────────────────────────────────────────
 *  Hook de layout: orientación + perfil de dispositivo
 *
 *  No basta con "portrait/landscape": una tablet apaisada y un
 *  móvil apaisado necesitan proporciones muy distintas. Aquí se
 *  decide el perfil con el lado MENOR del viewport (robusto ante
 *  giros) y se exponen medidas ya calculadas para que la mesa
 *  calce bien en cada caso.
 * ────────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from "react";
import type { DeviceKind } from "../game/types";

export interface LayoutInfo {
  width: number;
  height: number;
  isPortrait: boolean;
  device: DeviceKind;
  /** Pantallas muy bajas en apaisado (móvil tumbado): compactar. */
  isShort: boolean;
  /** Ancho de la columna del ticket (px) en layout de 3 columnas. */
  ticketWidth: number;
  /** Ancho de la vitrina de ingredientes (px) en 3 columnas. */
  pantryWidth: number;
  /** Tamaño de la mascota según el espacio disponible. */
  chefSize: number;
}

function read(): LayoutInfo {
  const width = typeof window === "undefined" ? 1024 : window.innerWidth;
  const height = typeof window === "undefined" ? 768 : window.innerHeight;
  const isPortrait = height >= width;
  const minSide = Math.min(width, height);
  const maxSide = Math.max(width, height);

  /*
   * Perfil de dispositivo:
   *  · móvil    → lado menor < 600 px (incluye el móvil tumbado).
   *  · tablet   → lado menor ≥ 600 px pero sin anchura de monitor.
   *  · escritorio → ancho ≥ 1200 px con lado menor cómodo.
   * Ojo: clasificar por "lado menor < 1024" marcaba un monitor
   * 1600×900 como tablet y estrechaba las columnas de más.
   */
  const device: DeviceKind =
    minSide < 600 ? "mobile" : width >= 1200 && minSide >= 600 ? "desktop" : "tablet";
  const isShort = !isPortrait && height < 520;

  // Columnas proporcionales al ancho, con topes sensatos por perfil
  const ticketWidth = isPortrait
    ? 0
    : Math.round(
        Math.min(
          device === "mobile" ? 210 : device === "tablet" ? 288 : 330,
          Math.max(168, maxSide * (device === "mobile" ? 0.25 : 0.23))
        )
      );
  const pantryWidth = isPortrait
    ? 0
    : Math.round(
        Math.min(
          device === "mobile" ? 196 : device === "tablet" ? 300 : 340,
          Math.max(158, maxSide * (device === "mobile" ? 0.23 : 0.235))
        )
      );

  /*
   * En vertical el itamae ocupa el aire que queda entre el ticket
   * y el plato (la escena se ancla abajo), así que crece con la
   * altura disponible en vez de quedarse diminuto.
   */
  const chefSize = isPortrait
    ? Math.round(Math.min(214, Math.max(104, height * 0.235)))
    : isShort
      ? 72
      : device === "mobile"
        ? 92
        : device === "tablet"
          ? Math.round(Math.min(168, height * 0.2))
          : Math.round(Math.min(172, height * 0.19));

  return { width, height, isPortrait, device, isShort, ticketWidth, pantryWidth, chefSize };
}

export function useLayout(): LayoutInfo {
  const [info, setInfo] = useState<LayoutInfo>(read);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setInfo(read()));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return info;
}
