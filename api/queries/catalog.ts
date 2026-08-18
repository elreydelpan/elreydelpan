import { getDb } from "./connection";
import { admins, categories, products, settings, media } from "@db/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function getCatalog() {
  const db = getDb();
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const prods = await db.select().from(products).orderBy(asc(products.sortOrder));
  return cats.map((c) => ({
    ...c,
    products: prods.filter((p) => p.categoryId === c.id),
  }));
}

export async function getFeatured() {
  return getDb().select().from(products).where(eq(products.featured, true));
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const rows = await getDb().select().from(settings);
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    try {
      out[r.key] = r.value ? JSON.parse(r.value) : null;
    } catch {
      out[r.key] = r.value;
    }
  }
  return out;
}

export async function setSetting(key: string, value: unknown) {
  await getDb()
    .insert(settings)
    .values({ key, value: JSON.stringify(value) })
    .onDuplicateKeyUpdate({ set: { value: JSON.stringify(value) } });
}

export async function findAdminByUsername(username: string) {
  return getDb().query.admins.findFirst({ where: eq(admins.username, username) });
}

export async function findMediaById(id: number) {
  return getDb().query.media.findFirst({ where: eq(media.id, id) });
}

export async function listMedia() {
  return getDb()
    .select({ id: media.id, mime: media.mime, createdAt: media.createdAt })
    .from(media)
    .orderBy(desc(media.id));
}
