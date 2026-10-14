/**
 * Mini-pictogramas SVG de cada ingrediente para la barra de trabajo.
 * Reusan las mismas paletas que el motor de sushi (fidelidad visual).
 */
import type { ReactNode } from "react";
import type { IngredientDef } from "../game/types";

export function IngredientIcon({ def, size = 44 }: { def: IngredientDef; size?: number }) {
  const p = def.palette;
  let body: ReactNode = null;

  switch (def.id) {
    case "shari":
      body = (
        <g>
          <ellipse cx="24" cy="29" rx="17" ry="10" fill={p.dark} opacity={0.5} />
          {[[16, 26, -18], [24, 23, 8], [31, 27, 20], [20, 31, 40], [28, 31, -30]].map(([x, y, r], k) => (
            <ellipse key={k} cx={x} cy={y} rx="5" ry="3.2" fill={k % 2 ? p.main : p.light} stroke={p.dark} strokeWidth="0.5" transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      );
      break;
    case "blackrice":
      body = (
        <g>
          <ellipse cx="24" cy="29" rx="17" ry="10" fill={p.dark} />
          {[[16, 26, -18], [24, 23, 8], [31, 27, 20], [20, 30, 40], [28, 30, -30]].map(([x, y, r], k) => (
            <ellipse key={k} cx={x} cy={y} rx="5" ry="3.2" fill={k % 2 ? p.main : p.light} transform={`rotate(${r} ${x} ${y})`} />
          ))}
          <circle cx="20" cy="25" r="1.3" fill={p.accent} />
          <circle cx="27" cy="27" r="1.3" fill={p.accent} />
          <circle cx="31" cy="23" r="1.3" fill={p.accent} />
        </g>
      );
      break;
    case "noriwrap":
      body = (
        <g>
          <ellipse cx="24" cy="30" rx="17" ry="9" fill="#fbf4e6" />
          <path d="M7 27 q0 -7 8 -6 q9 -3 18 0 q8 -1 8 6 l0 5 q-17 5 -34 0 Z" fill={p.dark} />
          <path d="M14 25 q10 -3 20 0" stroke={p.light} strokeWidth="1.4" fill="none" opacity="0.6" />
        </g>
      );
      break;
    case "cucumber":
      body = (
        <g>
          <ellipse cx="24" cy="25" rx="17" ry="12" fill={p.main} />
          <path d="M12 20 v10 M20 18 v12 M28 18 v12 M36 20 v10" stroke={p.dark} strokeWidth="2" opacity="0.6" />
          <ellipse cx="24" cy="20" rx="13" ry="6.5" fill={p.light} />
        </g>
      );
      break;
    case "inari":
      body = (
        <g>
          <path d="M9 33 q-2 -14 8 -17 q7 -4 14 0 q10 3 8 17 q-15 5 -30 0 Z" fill={p.main} />
          <path d="M12 29 q12 6 24 0" stroke={p.dark} strokeWidth="1.6" fill="none" opacity="0.6" />
          <ellipse cx="24" cy="17" rx="9" ry="3.4" fill={p.dark} />
          <ellipse cx="24" cy="16.4" rx="7" ry="2.4" fill={p.accent} />
        </g>
      );
      break;
    case "salmon":
      body = (
        <g>
          <rect x="8" y="17" width="32" height="16" rx="7" fill={p.main} />
          <path d="M15 19 q-2 7 1 13 M24 19 q-2 7 1 13 M33 19 q-2 7 1 13" stroke={p.accent} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "tuna":
      body = (
        <g>
          <rect x="8" y="17" width="32" height="16" rx="7" fill={p.main} />
          <rect x="9" y="27" width="30" height="5" rx="2.5" fill={p.dark} opacity="0.5" />
          <ellipse cx="20" cy="20" rx="9" ry="1.8" fill={p.accent} opacity="0.6" />
        </g>
      );
      break;
    case "butterfish":
      body = (
        <g>
          <rect x="8" y="17" width="32" height="16" rx="7" fill={p.main} stroke={p.dark} strokeWidth="1" />
          <ellipse cx="20" cy="20.5" rx="11" ry="2.2" fill="#ffffff" opacity="0.95" />
          <ellipse cx="33" cy="24" rx="5" ry="1.4" fill="#ffffff" opacity="0.6" />
          <path d="M11 29 h26" stroke={p.dark} strokeWidth="1.3" opacity="0.5" />
        </g>
      );
      break;
    case "shrimp":
      body = (
        <g>
          <rect x="6" y="17" width="30" height="16" rx="8" fill={p.main} />
          <g stroke={p.dark} strokeWidth="1.6" fill="none" opacity="0.6" strokeLinecap="round">
            <path d="M13 18 q3 7 0 14" />
            <path d="M21 18 q3 7 0 14" />
            <path d="M29 18 q3 7 0 14" />
          </g>
          <path d="M10 20 q13 -3 24 0" stroke={p.light} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M36 25 l8 -5 -1 5 1 5 Z" fill={p.dark} stroke={p.light} strokeWidth="0.6" />
        </g>
      );
      break;
    case "unagi":
      body = (
        <g>
          <rect x="8" y="17" width="32" height="16" rx="6" fill={p.main} />
          <g stroke="#2e1a0c" strokeWidth="1.8" opacity="0.45" strokeLinecap="round">
            <path d="M15 19 l-2 12" />
            <path d="M23 19 l-2 12" />
            <path d="M31 19 l-2 12" />
            <path d="M38 19 l-2 12" />
          </g>
          <path d="M11 20 q13 -4 26 0" stroke={p.accent} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "tamago":
      body = (
        <g>
          <rect x="8" y="16" width="32" height="17" rx="5" fill={p.main} />
          <rect x="9" y="28" width="30" height="4" rx="2" fill={p.dark} opacity="0.5" />
          <path d="M12 21 h24 M13 25 h22" stroke={p.dark} strokeWidth="1.2" opacity="0.45" />
        </g>
      );
      break;
    /* Cada salsa tiene su propio GESTO, no solo su color:
       soya = hilo líquido fino que gotea · sriracha = zigzag
       cremoso grueso con picante · unagi = cinta lacada brillante
       palta = dollop cremoso en espiral · wasabi = montoncito. */
    case "soy":
      body = (
        <g>
          <circle cx="24" cy="26" r="14" fill={p.light} opacity="0.25" />
          <path d="M10 22 L16 18 L21 28 L27 18 L32 28 L38 20" fill="none" stroke={p.main} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 33 q0 5 0 5 a3 3 0 1 1 0 -5 Z" fill={p.main} />
          <circle cx="23" cy="36" r="1" fill="#fff" opacity="0.5" />
        </g>
      );
      break;
    case "sriracha":
      body = (
        <g>
          <circle cx="24" cy="26" r="14" fill={p.light} opacity="0.4" />
          <path d="M10 24 L16 19 L21 30 L27 19 L32 30 L38 22" fill="none" stroke={p.main} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 22.4 L16 17.4 L20 25" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.65" strokeLinecap="round" />
          <circle cx="33" cy="33" r="1.6" fill={p.dark} />
          <circle cx="16" cy="34" r="1.3" fill={p.dark} />
        </g>
      );
      break;
    case "unagisauce":
      body = (
        <g>
          <circle cx="24" cy="26" r="14" fill={p.light} opacity="0.35" />
          <path d="M9 30 q8 -14 16 -6 q8 8 15 -6" fill="none" stroke={p.dark} strokeWidth="6.4" strokeLinecap="round" />
          <path d="M9 30 q8 -14 16 -6 q8 8 15 -6" fill="none" stroke={p.main} strokeWidth="4.6" strokeLinecap="round" />
          <path d="M11 28 q7 -11 14 -5" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.75" strokeLinecap="round" />
        </g>
      );
      break;
    case "avocado":
      body = (
        <g>
          <circle cx="24" cy="26" r="14" fill={p.light} opacity="0.4" />
          <path
            d="M33 15 q-16 -2 -16 9 q0 8 9 8 q7 0 7 -6 q0 -5 -6 -5 q-4 0 -4 3"
            fill="none"
            stroke={p.main}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M31 17 q-12 -1 -13 7" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
        </g>
      );
      break;
    case "wasabi":
      body = (
        <g>
          <circle cx="24" cy="26" r="14" fill={p.light} opacity="0.35" />
          <path d="M24 12 q7 10 9 15 q3 7 -9 7 q-12 0 -9 -7 q2 -5 9 -15 Z" fill={p.main} stroke={p.dark} strokeWidth="1.2" />
          <path d="M22 20 q-3 6 -4 9" stroke="#fff" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round" />
        </g>
      );
      break;
    case "tobiko":
      body = (
        <g fill={p.main}>
          {[[16, 22], [23, 19], [30, 22], [13, 29], [21, 27], [29, 29], [35, 27], [25, 33]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={k % 2 ? 3 : 3.6} fill={k % 2 ? p.light : p.main} />
          ))}
          <circle cx="22" cy="18" r="1" fill="#fff" />
          <circle cx="29" cy="21" r="1" fill="#fff" />
        </g>
      );
      break;
    case "sesame":
      body = (
        <g>
          {[[14, 21, 20], [22, 17, -30], [30, 20, 60], [36, 25, -15], [16, 29, 70], [25, 26, 10], [33, 31, -50], [20, 34, 40], [28, 13, 0]].map(
            ([x, y, r], k) => (
              <g key={k} transform={`rotate(${r} ${x} ${y})`}>
                <ellipse cx={x} cy={y} rx="3.8" ry="2.4" fill={k % 2 ? p.light : p.dark} stroke={k % 2 ? p.main : "none"} strokeWidth="0.7" />
                {k % 2 === 1 && <ellipse cx={x - 0.9} cy={y - 0.6} rx="1.3" ry="0.8" fill="#fff" opacity="0.85" />}
              </g>
            )
          )}
        </g>
      );
      break;
    case "scallion":
      body = (
        <g>
          {[[14, 21], [23, 18], [31, 22], [18, 29], [27, 30], [34, 29]].map(([x, y], k) => (
            <g key={k}>
              <circle cx={x} cy={y} r={k % 2 ? 4 : 4.6} fill={k % 2 ? p.light : p.main} />
              <circle cx={x} cy={y} r={k % 2 ? 1.7 : 2} fill="#f3fbe9" />
              <circle cx={x} cy={y} r={k % 2 ? 4 : 4.6} fill="none" stroke={p.dark} strokeWidth="0.8" opacity="0.7" />
            </g>
          ))}
        </g>
      );
      break;
    case "noristrips":
      body = (
        <g fill={p.main}>
          {[[14, 21, -20], [24, 18, 15], [32, 23, -35], [18, 29, 25], [29, 30, -10]].map(([x, y, r], k) => (
            <rect key={k} x={x - 8} y={y - 1.8} width="16" height="3.6" rx="1.5" fill={p.main} opacity={0.95} transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      );
      break;
    case "gari":
      body = (
        <g>
          {[[12, 26, -18], [21, 18, 14], [24, 31, -34]].map(([x, y, r], k) => (
            <g key={k} transform={`rotate(${r} ${x} ${y})`}>
              <path
                d={`M ${x} ${y} q 10 -9 18 -2 q 2 9 -7 12 q -13 3 -11 -10 Z`}
                fill={k === 1 ? p.light : p.main}
                stroke={p.dark}
                strokeWidth="1.1"
              />
              <path d={`M ${x + 3} ${y} q 8 -5 13 -1`} stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.75" strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
      break;
    case "vegcaviar":
      body = (
        <g>
          {[[17, 23], [25, 20], [32, 24], [20, 29], [28, 30], [24, 34]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={k % 2 ? 3.4 : 4} fill={k % 2 ? p.light : p.main} />
          ))}
          <circle cx="24" cy="19" r="1.1" fill="#fff" opacity="0.8" />
          <circle cx="31" cy="23" r="1.1" fill="#fff" opacity="0.8" />
        </g>
      );
      break;
    default:
      body = <circle cx="24" cy="24" r="12" fill={p.main} />;
  }

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      {body}
    </svg>
  );
}
