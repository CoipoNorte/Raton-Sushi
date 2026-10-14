/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Catálogo de ingredientes y paletas
 *  El motor SVG (SushiRenderer) dibuja cada id de forma procedural
 *  usando estos colores; misma fuente de verdad para ticket y plato.
 * ────────────────────────────────────────────────────────────────
 */
import type { Category, IngredientDef } from "./types";

/* ── 1 · Base / Arroz ────────────────────────────────────────── */
const BASES: IngredientDef[] = [
  {
    id: "shari",
    category: "base",
    name: "Arroz shari tradicional",
    short: "Shari",
    blurb: "Grano tibio con vinagre suave",
    palette: { main: "#fbf4e6", light: "#fffdf6", dark: "#e6d5b6", accent: "#d5bd92" },
  },
  {
    id: "blackrice",
    category: "base",
    name: "Arroz negro con sésamo",
    short: "Arroz negro",
    blurb: "Tierra dulce y sésamo tostado",
    palette: { main: "#575066", light: "#6d6580", dark: "#3a3444", accent: "#f2e6cf" },
  },
  {
    id: "noriwrap",
    category: "base",
    name: "Hoja de nori envuelta",
    short: "Nori",
    blurb: "Crujiente brisa de mar",
    palette: { main: "#3c4732", light: "#56633f", dark: "#242c1e", accent: "#fbf4e6" },
  },
  {
    id: "cucumber",
    category: "base",
    name: "Base de pepino gunkan",
    short: "Pepino",
    blurb: "Fresco, húmedo y crujiente",
    palette: { main: "#4e9e6a", light: "#bfe3c9", dark: "#2f6e45", accent: "#7cc294" },
  },
  {
    id: "inari",
    category: "base",
    name: "Inari de tofu frito",
    short: "Inari",
    blurb: "Bolsita dorada agridulce",
    palette: { main: "#cf8c45", light: "#eeb470", dark: "#9c6124", accent: "#fff2de" },
  },
];

/* ── 2 · Pescado / Proteína ──────────────────────────────────── */
const PROTEINS: IngredientDef[] = [
  {
    id: "salmon",
    category: "protein",
    name: "Salmón fresco",
    short: "Salmón",
    blurb: "Vetas de grasa sedosa",
    palette: { main: "#ff8f6b", light: "#ffbda4", dark: "#e0693f", accent: "#fff1e8" },
  },
  {
    id: "tuna",
    category: "protein",
    name: "Atún rojo",
    short: "Atún",
    blurb: "Rubí intenso del pacífico",
    palette: { main: "#c0334f", light: "#d8596f", dark: "#8c1f36", accent: "#e88a9b" },
  },
  {
    id: "butterfish",
    category: "protein",
    name: "Pez mantequilla",
    short: "Mantequilla",
    blurb: "Pálido, tierno, nacarado",
    palette: { main: "#e6ecf2", light: "#f7fafd", dark: "#b9c6d4", accent: "#ffffff" },
  },
  {
    id: "shrimp",
    category: "protein",
    name: "Langostino cocido",
    short: "Langostino",
    blurb: "Coral dulzón al vapor",
    palette: { main: "#ff9fb0", light: "#ffc9d3", dark: "#e06a85", accent: "#fff0f3" },
  },
  {
    id: "unagi",
    category: "protein",
    name: "Anguila unagi glaseada",
    short: "Unagi",
    blurb: "Caramelo oscuro y ahumado",
    palette: { main: "#8c5a33", light: "#b57c4d", dark: "#5c3418", accent: "#ffcf8a" },
  },
  {
    id: "tamago",
    category: "protein",
    name: "Tamagoyaki dulce",
    short: "Tamago",
    blurb: "Nube amarilla por capas",
    palette: { main: "#ffd35c", light: "#ffe69a", dark: "#e0a536", accent: "#fff3c4" },
  },
];

/* ── 3 · Salsas / Glaseados ──────────────────────────────────── */
const SAUCES: IngredientDef[] = [
  {
    id: "soy",
    category: "sauce",
    name: "Soya concentrada",
    short: "Soya",
    blurb: "Umami profundo y salino",
    palette: { main: "#3d2a1d", light: "#6b4a33", dark: "#241509", accent: "#a87a52" },
  },
  {
    id: "sriracha",
    category: "sauce",
    name: "Mayonesa sriracha",
    short: "Sriracha",
    blurb: "Picor cremoso y rosado",
    palette: { main: "#ff6f61", light: "#ffa79c", dark: "#d4453a", accent: "#ffe8e4" },
  },
  {
    id: "unagisauce",
    category: "sauce",
    name: "Salsa unagi dulce",
    short: "Unagi dulce",
    blurb: "Lacado ámbar brillante",
    palette: { main: "#c67a1e", light: "#eda94a", dark: "#8a4f0c", accent: "#ffe3b0" },
  },
  {
    id: "avocado",
    category: "sauce",
    name: "Crema de palta",
    short: "Palta",
    blurb: "Verde manteca y fresca",
    palette: { main: "#a8cf7a", light: "#cfe8ad", dark: "#789c4c", accent: "#f0f7e2" },
  },
  {
    id: "wasabi",
    category: "sauce",
    name: "Wasabi fundido",
    short: "Wasabi",
    blurb: "Cosquilleo verde suave",
    palette: { main: "#d2e05c", light: "#e9f0a3", dark: "#9aa832", accent: "#f8fbdc" },
  },
];

/* ── 4 · Toppings / Decoración ───────────────────────────────── */
const TOPPINGS: IngredientDef[] = [
  {
    id: "tobiko",
    category: "topping",
    name: "Ovas de tobiko rojo",
    short: "Tobiko",
    blurb: "Palomitas de mar crujientes",
    palette: { main: "#ff8c1a", light: "#ffbb6b", dark: "#d96a00", accent: "#ffe6c2" },
  },
  {
    id: "sesame",
    category: "topping",
    name: "Sésamo tostado bicolor",
    short: "Sésamo",
    blurb: "Lluvia tostada blanco/negro",
    palette: { main: "#b99256", light: "#f4e8cf", dark: "#2f2a26", accent: "#ffffff" },
  },
  {
    id: "scallion",
    category: "topping",
    name: "Cebollín fino",
    short: "Cebollín",
    blurb: "Verde fresco recién cortado",
    palette: { main: "#3fae4a", light: "#7bd682", dark: "#277a30", accent: "#c7f0c9" },
  },
  {
    id: "noristrips",
    category: "topping",
    name: "Tiras de nori",
    short: "Tiras nori",
    blurb: "Cintas oscuras de umami",
    palette: { main: "#232a20", light: "#3c4732", dark: "#141a12", accent: "#56633f" },
  },
  {
    id: "gari",
    category: "topping",
    name: "Láminas de jengibre gari",
    short: "Gari",
    blurb: "Pétalos rosados agridulces",
    palette: { main: "#f2c2d8", light: "#fbe0ec", dark: "#d48db0", accent: "#fff2f8" },
  },
  {
    id: "vegcaviar",
    category: "topping",
    name: "Caviar vegetal de wasabi",
    short: "Caviar verde",
    blurb: "Perlas verdes lustrosas",
    palette: { main: "#1fa88f", light: "#5fd1bb", dark: "#127a67", accent: "#c4f0e6" },
  },
];

/** Catálogo completo, en orden de vitrina. */
export const INGREDIENTS: IngredientDef[] = [...BASES, ...PROTEINS, ...SAUCES, ...TOPPINGS];

/** Acceso O(1) por id. */
export const INGREDIENTS_BY_ID: ReadonlyMap<string, IngredientDef> = new Map(
  INGREDIENTS.map((i) => [i.id, i])
);

/** Ingredientes agrupados por categoría (para la barra de trabajo). */
export const INGREDIENTS_BY_CATEGORY: Record<Category, IngredientDef[]> = {
  base: BASES,
  protein: PROTEINS,
  sauce: SAUCES,
  topping: TOPPINGS,
};

/** Metadatos de pestañas (icono lucide se resuelve en la UI). */
export const CATEGORY_META: Record<Category, { label: string; full: string; tint: string }> = {
  base: { label: "Base", full: "Base / Arroz", tint: "#c9a06b" },
  protein: { label: "Peces", full: "Pescado / Proteína", tint: "#ef7f5a" },
  sauce: { label: "Salsas", full: "Salsas / Glaseados", tint: "#c07f3e" },
  topping: { label: "Extras", full: "Toppings / Decoración", tint: "#7fc46b" },
};
