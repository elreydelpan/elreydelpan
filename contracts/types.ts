export * from "./errors";

export type PriceTier = { minQty: number; price: number };

export type ProductDto = {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string | null;
  priceTiers: PriceTier[];
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export type CatalogCategory = {
  id: number;
  name: string;
  sortOrder: number;
  active: boolean;
  products: ProductDto[];
};

export type BannerSlide = { image: string; title: string; subtitle: string };

export type SettingsMap = {
  heroTitle?: string;
  heroSubtitle?: string;
  aboutText?: string;
  hours?: string;
  address?: string;
  mapEmbedUrl?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  bannerSlides?: BannerSlide[];
  [key: string]: unknown;
};

export const WHATSAPP_NUMBER_FALLBACK = "5491127414110";
