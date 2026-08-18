import {
  mysqlTable,
  serial,
  bigint,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";

export type PriceTier = { minQty: number; price: number };

export const admins = mysqlTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  unit: varchar("unit", { length: 100 }),
  // JSON array of { minQty, price } — price in ARS (integer)
  priceTiers: json("price_tiers").$type<PriceTier[]>().notNull(),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
});

export const media = mysqlTable("media", {
  id: serial("id").primaryKey(),
  mime: varchar("mime", { length: 100 }).notNull(),
  data: text("data").notNull(), // base64
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Admin = typeof admins.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Media = typeof media.$inferSelect;
