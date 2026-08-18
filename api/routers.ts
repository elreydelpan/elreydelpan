import { z } from "zod";
import bcrypt from "bcryptjs";
import { createRouter, publicQuery } from "./middleware";
import { adminQuery, createToken, sessionCookie, clearCookie } from "./adminAuth";
import {
  getCatalog,
  getFeatured,
  getAllSettings,
  setSetting,
  findAdminByUsername,
  listMedia,
} from "./queries/catalog";
import { getDb } from "./queries/connection";
import { admins, categories, products, media } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const tierSchema = z.object({ minQty: z.number().int().min(1), price: z.number().int().min(0) });

const productInput = z.object({
  name: z.string().min(1),
  categoryId: z.number().int().positive(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  unit: z.string().nullish(),
  priceTiers: z.array(tierSchema).min(1),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const authRouter = createRouter({
  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const admin = await findAdminByUsername(input.username);
      if (!admin || !bcrypt.compareSync(input.password, admin.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario o contraseña incorrectos" });
      }
      ctx.resHeaders.set("set-cookie", sessionCookie(createToken(admin.id)));
      return { ok: true, username: admin.username };
    }),

  logout: publicQuery.mutation(({ ctx }) => {
    ctx.resHeaders.set("set-cookie", clearCookie());
    return { ok: true };
  }),

  me: adminQuery.query(({ ctx }) => ({ adminId: ctx.adminId })),

  changePassword: adminQuery
    .input(z.object({ current: z.string().min(1), next: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const admin = await db.query.admins.findFirst({ where: eq(admins.id, ctx.adminId) });
      if (!admin || !bcrypt.compareSync(input.current, admin.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "La contraseña actual es incorrecta" });
      }
      const passwordHash = bcrypt.hashSync(input.next, 12);
      await db.update(admins).set({ passwordHash }).where(eq(admins.id, ctx.adminId));
      return { ok: true };
    }),
});

export const catalogRouter = createRouter({
  list: publicQuery.query(() => getCatalog()),
  featured: publicQuery.query(() => getFeatured()),
  settings: publicQuery.query(() => getAllSettings()),
});

export const adminRouter = createRouter({
  // Categorías
  createCategory: adminQuery
    .input(z.object({ name: z.string().min(1), sortOrder: z.number().int().default(0) }))
    .mutation(async ({ input }) => {
      const [{ id }] = await getDb().insert(categories).values(input).$returningId();
      return { id };
    }),
  updateCategory: adminQuery
    .input(z.object({ id: z.number().int().positive(), name: z.string().min(1), sortOrder: z.number().int(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb().update(categories).set(data).where(eq(categories.id, id));
      return { ok: true };
    }),
  deleteCategory: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.categoryId, input.id));
      await db.delete(categories).where(eq(categories.id, input.id));
      return { ok: true };
    }),

  // Productos
  createProduct: adminQuery.input(productInput).mutation(async ({ input }) => {
    const [{ id }] = await getDb().insert(products).values(input).$returningId();
    return { id };
  }),
  updateProduct: adminQuery
    .input(productInput.extend({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb().update(products).set(data).where(eq(products.id, id));
      return { ok: true };
    }),
  deleteProduct: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await getDb().delete(products).where(eq(products.id, input.id));
      return { ok: true };
    }),
  toggleFeatured: adminQuery
    .input(z.object({ id: z.number().int().positive(), featured: z.boolean() }))
    .mutation(async ({ input }) => {
      await getDb().update(products).set({ featured: input.featured }).where(eq(products.id, input.id));
      return { ok: true };
    }),

  // Configuración general
  updateSettings: adminQuery
    .input(z.object({ entries: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      for (const [key, value] of Object.entries(input.entries)) {
        await setSetting(key, value);
      }
      return { ok: true };
    }),

  // Imágenes (base64 -> DB, servidas en /api/media/:id)
  uploadMedia: adminQuery
    .input(z.object({ mime: z.string().regex(/^image\//), dataBase64: z.string().max(14_000_000) }))
    .mutation(async ({ input }) => {
      const [{ id }] = await getDb()
        .insert(media)
        .values({ mime: input.mime, data: input.dataBase64 })
        .$returningId();
      return { id, url: `/api/media/${id}` };
    }),
  listMedia: adminQuery.query(() => listMedia()),
});
