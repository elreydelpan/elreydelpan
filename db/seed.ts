import { getDb } from "../api/queries/connection";
import { admins, categories, products, settings } from "./schema";
import type { PriceTier } from "./schema";
import bcrypt from "bcryptjs";

const t = (...pairs: [number, number][]): PriceTier[] =>
  pairs.map(([minQty, price]) => ({ minQty, price }));

type CatDef = {
  name: string;
  unit?: string;
  imageUrl?: string;
  items: { name: string; tiers: PriceTier[]; featured?: boolean }[];
};

const CATALOG: CatDef[] = [
  {
    name: "Pan El Remanso",
    imageUrl: "/img/cat-pan.png",
    items: [
      { name: "Pan Clásico", tiers: t([1, 2000], [10, 1500], [30, 1450], [100, 1400]), featured: true },
      { name: "Pan Salvado", tiers: t([1, 2000], [10, 1500], [30, 1450], [100, 1400]) },
      { name: "Pan con Mix de Semillas", tiers: t([1, 2000], [10, 1500], [30, 1450], [100, 1400]), featured: true },
      { name: "Pan de Campo", tiers: t([1, 2000], [10, 1500], [30, 1450], [100, 1400]) },
      { name: "Pan Brioche", tiers: t([1, 2000], [10, 1900], [30, 1900], [100, 1850]) },
      { name: "Pan de Masa Madre", tiers: t([1, 2000], [10, 1900], [30, 1900], [100, 1850]) },
      { name: "Pan de Salvado con Mix de Semillas", tiers: t([1, 2000], [10, 1900], [30, 1900], [100, 1850]) },
      { name: "Pan Integral", tiers: t([1, 2000], [10, 1900], [30, 1900], [100, 1850]) },
    ],
  },
  {
    name: "Pan El Rocío / Remanso",
    imageUrl: "/img/cat-pan.png",
    items: [
      { name: "Pan Hamburguesa Rocío", tiers: t([1, 1400], [16, 1200]), featured: true },
      { name: "Pan Hamburguesa Maxi Rocío", tiers: t([1, 1500], [16, 1400]) },
      { name: "Pan Pancho Rocío", tiers: t([1, 1200], [16, 1200]), featured: true },
      { name: "Super Pancho Rocío", tiers: t([1, 1500], [16, 1400]) },
      { name: "Pan de Hamburguesa Remanso", tiers: t([1, 1200], [16, 1200]) },
      { name: "Pan de Hamburguesa Maxi Remanso", tiers: t([1, 1500], [16, 1400]) },
    ],
  },
  {
    name: "Papas Quento 45g",
    unit: "x45gr",
    items: ["Clásicas", "Salame", "Cheddar", "Ketchup", "Ciboulette", "Batatas", "Conos Queso", "Nachos", "Mega Queso"].map(
      (n) => ({ name: `Papas ${n}`, tiers: t([1, 1500], [10, 1200], [108, 1000]) })
    ),
  },
  {
    name: "Papas Quento 90g",
    unit: "x90gr",
    items: ["Clásicas", "Salame", "Cheddar", "Ketchup", "Ciboulette", "Batatas", "Conos Queso", "Nachos", "Mega Queso", "Asado", "Limón", "Mostaza", "Mix", "Picantes", "Nachos Picantes", "Sin Sal", "Nachos Guacamole", "Onduladas", "Papas Pay", "Barbacoa"].map(
      (n, i) => ({ name: `Papas ${n}`, tiers: t([1, 2300], [10, 1950], [90, 1800]), featured: i === 0 })
    ),
  },
  {
    name: "Papas Quento 475g",
    unit: "x475gr",
    items: [
      { name: "Papas Clásicas", tiers: t([1, 7500], [16, 6150]) },
      { name: "Papas Onduladas", tiers: t([1, 7500], [16, 6150]) },
      { name: "Batatas", tiers: t([1, 7500], [16, 6150]) },
      { name: "Papas Pay", tiers: t([1, 7500], [16, 6150]) },
      { name: "Mega Queso", tiers: t([1, 5000], [16, 4500]) },
    ],
  },
  {
    name: "Tostaditas 95g",
    unit: "x95gr",
    items: [
      { name: "Tostaditas Jamón", tiers: t([1, 2000], [32, 1600]) },
      { name: "Tostaditas Queso", tiers: t([1, 2000], [32, 1600]) },
      { name: "Tostaditas Arroz", tiers: t([1, 1000], [32, 900]) },
    ],
  },
  {
    name: "Palitos y Otros",
    items: [
      { name: "Palitos x85gr", tiers: t([1, 1600], [10, 1400]) },
      { name: "Palitos x600gr", tiers: t([1, 6000], [10, 5400]) },
    ],
  },
  {
    name: "Kiosko",
    items: [
      "AGUA IVESS 6,5LT|2500", "AGUA IVESS 750ML|1500", "AGUA IVESS 750ML X18|13150",
      "AGUA MINERAL ORIENTE 10LT|2500", "ALFAJOR GUAYMALLEN N/B|10600", "ALFAJOR FULBITO|6400",
      "BON O BON OBLEA N/B X20U|17000", "BON O BON X30|14000", "MOGUL OSITOS X12|6400",
      "MOGUL PIECITOS X12|6400", "MOGUL TIBURONCITOS X12|6400", "GOMITAS FRUTALES GOMUTCHO X30|6500",
      "YUMMY MORITAS|5000", "YUMMY DINO|5000", "YUMMY ANIMALITOS|5000", "YUMMY OSITOS|5000",
      "YUMMY PECECITOS|5000", "YUMMY OSITOS ÁCIDOS 150GR|1500", "GUMMY FRUTILLITA X30U|8000",
      "GOMITAS OJITOS X30U|8000", "MISKY SURTIDOS 800GR|5600", "MISKY GOMITAS EUCALIPTUS 1KG|9300",
      "MISKY TURRÓN X50U|9000", "BILLIKEN YOGUR 600GR|4100", "SAPITO CAJA|6000",
      "PALITOS DE LA SELVA ÁCIDOS|3500", "LENGÜETAZO CAJA|3500", "ALFAJOR QUENTO B/N X18|16500",
      "FREEGELLS|2900", "SMACK X48|13700",
    ].map((s) => {
      const [name, price] = s.split("|");
      return { name: name.charAt(0) + name.slice(1).toLowerCase(), tiers: t([1, Number(price)]) };
    }),
  },
  {
    name: "Combos",
    items: [
      { name: "Kandy Hamburguesa x40 c/pan", tiers: t([1, 33000]), featured: true },
      { name: "Kandy Hamburguesa x20 c/pan", tiers: t([1, 16500]) },
      { name: "Defensa Hamburguesa x40 c/pan", tiers: t([1, 29000]) },
      { name: "Defensa Hamburguesa x20 c/pan", tiers: t([1, 14500]) },
      { name: "Super Pancho x72 c/pan", tiers: t([1, 35500]) },
      { name: "Super Pancho x36 c/pan", tiers: t([1, 18000]) },
      { name: "Pancho Corto x144 c/pan", tiers: t([1, 48500]) },
      { name: "Pancho Corto x72 c/pan", tiers: t([1, 25000]) },
      { name: "Caja 40 Hamburguesas Kandy", tiers: t([1, 23000]) },
      { name: "Caja 40 Hamburguesas Defensa", tiers: t([1, 18000]) },
    ],
  },
];

const DEFAULT_SETTINGS: Record<string, unknown> = {
  heroTitle: "EL REY DEL PAN",
  heroSubtitle: "Distribuidora mayorista · Mejores precios que fábrica",
  aboutText:
    "Somos una distribuidora mayorista líder en pan lactal El Remanso y papas fritas línea Quento. Abastecemos kioscos, almacenes y comercios de la zona con los mejores precios, directo de fábrica.",
  hours: "Lunes a Sábado de 8:00 a 18:00 hs",
  address: "Juan Manuel de Rosas 1153, Gregorio de Laferrère, Buenos Aires",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Juan%20Manuel%20de%20Rosas%201153%2C%20Gregorio%20de%20Laferr%C3%A8re%2C%20Buenos%20Aires%2C%20Argentina&t=&z=16&ie=UTF8&iwloc=&output=embed",
  instagram: "https://instagram.com/el_rey_del_pan_okk",
  tiktok: "https://tiktok.com/@elreydelpan.ok",
  whatsapp: "5491127414110",
  bannerSlides: [
    { image: "/img/banner1.png", title: "Distribuidora Mayorista", subtitle: "Mejores precios que fábrica" },
  ],
};

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Admin por defecto (cambiar la contraseña desde el panel)
  const existingAdmin = await db.query.admins.findFirst();
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync("ElRey2026!", 12);
    await db.insert(admins).values({ username: "admin", passwordHash });
    console.log("Admin creado: usuario 'admin' (contraseña por defecto, cambiarla en el panel)");
  }

  const existingCats = await db.query.categories.findMany();
  if (existingCats.length === 0) {
    let sort = 0;
    for (const cat of CATALOG) {
      const [{ id: catId }] = await db
        .insert(categories)
        .values({ name: cat.name, sortOrder: sort++ })
        .$returningId();
      let pSort = 0;
      for (const item of cat.items) {
        await db.insert(products).values({
          categoryId: catId,
          name: item.name,
          unit: cat.unit ?? null,
          imageUrl: cat.imageUrl ?? null,
          priceTiers: item.tiers,
          featured: item.featured ?? false,
          sortOrder: pSort++,
        });
      }
    }
    console.log("Catálogo cargado.");
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db
      .insert(settings)
      .values({ key, value: JSON.stringify(value) })
      .onDuplicateKeyUpdate({ set: { key } });
  }
  console.log("Settings cargados. Done.");
  process.exit(0);
}

seed();
