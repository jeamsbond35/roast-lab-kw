// Dynamic catalog store backed by localStorage.
// Replaces the static catalog when the admin has populated data.
import { useEffect, useState } from "react";
import {
  deleteBrandRemote,
  deleteProductRemote,
  deleteRoasterRemote,
  pushBrand,
  pushProduct,
  pushRoaster,
} from "@/lib/supabase/catalogSync";

export type Roaster = {
  slug: string;
  name: string;
  origin: string;
  description: string;
  logo?: string; // dataURL or url
};

export type ProductCategory = "coffee" | "equipment" | "other";
export type CoffeeType = "filter" | "espresso" | "omni";

// فئات المعدات الافتراضية - مفتوحة للتوسعة
export const EQUIPMENT_TYPES = ["v60", "grinders", "filters", "cups", "other"] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number] | string;

export const equipmentTypeLabel = (t?: string) => {
  switch (t) {
    case "v60": return "V60";
    case "grinders": return "المطاحن";
    case "filters": return "الفلاتر";
    case "cups": return "الأكواب";
    case "other": return "أخرى";
    default: return t ?? "";
  }
};

export type EquipmentBrand = {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
};

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  roasterSlug: string;
  roaster: string; // denormalized for display
  price: number; // selling price
  cost?: number; // cost price (admin-only)
  weight?: string; // e.g. "250g", "1kg"
  img: string;
  tag?: string;
  details?: string;
  qty?: number;

  // Coffee-only fields
  coffeeType?: CoffeeType;
  origin?: string;
  altitude?: string;
  variety?: string; // السلالة
  process?: string; // المعالجة
  notes?: string; // الإيحاءات
  hidden?: boolean; // إخفاء يدوي من الواجهة العامة

  // Equipment-only fields
  brandSlug?: string;
  brand?: string; // denormalized
  equipmentType?: EquipmentType;
};

const ROASTERS_KEY = "rl_roasters_v1";
const PRODUCTS_KEY = "rl_products_v1";
const BRANDS_KEY = "rl_equipment_brands_v1";

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const getRoasters = (): Roaster[] =>
  safeParse<Roaster[]>(localStorage.getItem(ROASTERS_KEY), []);

export const getProducts = (): Product[] =>
  safeParse<Product[]>(localStorage.getItem(PRODUCTS_KEY), []);

export const getBrands = (): EquipmentBrand[] =>
  safeParse<EquipmentBrand[]>(localStorage.getItem(BRANDS_KEY), []);

export const saveRoasters = (list: Roaster[]) => {
  localStorage.setItem(ROASTERS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("catalog:changed"));
};

export const saveProducts = (list: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("catalog:changed"));
};

export const upsertRoaster = (r: Roaster) => {
  const list = getRoasters();
  const i = list.findIndex((x) => x.slug === r.slug);
  if (i >= 0) list[i] = r;
  else list.push(r);
  saveRoasters(list);
  // Update denormalized roaster name on existing products
  const prods = getProducts().map((p) =>
    p.roasterSlug === r.slug ? { ...p, roaster: r.name } : p,
  );
  saveProducts(prods);
  pushRoaster(r);
  prods.forEach((p) => { if (p.roasterSlug === r.slug) pushProduct(p); });
};

export const deleteRoaster = (slug: string) => {
  const removedIds = getProducts().filter((p) => p.roasterSlug === slug).map((p) => p.id);
  saveRoasters(getRoasters().filter((r) => r.slug !== slug));
  saveProducts(getProducts().filter((p) => p.roasterSlug !== slug));
  deleteRoasterRemote(slug, removedIds);
};

export const upsertProduct = (p: Product) => {
  const list = getProducts();
  const i = list.findIndex((x) => x.id === p.id);
  if (i >= 0) list[i] = p;
  else list.push(p);
  saveProducts(list);
  pushProduct(p);
};

export const deleteProduct = (id: string) => {
  saveProducts(getProducts().filter((p) => p.id !== id));
  deleteProductRemote(id);
};

export const saveBrands = (list: EquipmentBrand[]) => {
  localStorage.setItem(BRANDS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("catalog:changed"));
};

export const upsertBrand = (b: EquipmentBrand) => {
  const list = getBrands();
  const i = list.findIndex((x) => x.slug === b.slug);
  if (i >= 0) list[i] = b;
  else list.push(b);
  saveBrands(list);
  // update denormalized brand name on products
  const prods = getProducts().map((p) =>
    p.brandSlug === b.slug ? { ...p, brand: b.name } : p,
  );
  saveProducts(prods);
  pushBrand(b);
  prods.forEach((p) => { if (p.brandSlug === b.slug) pushProduct(p); });
};

export const deleteBrand = (slug: string) => {
  const linked = getProducts().filter((p) => p.brandSlug === slug);
  saveBrands(getBrands().filter((b) => b.slug !== slug));
  const prods = getProducts().map((p) =>
    p.brandSlug === slug ? { ...p, brandSlug: undefined, brand: undefined } : p,
  );
  saveProducts(prods);
  deleteBrandRemote(slug);
  linked.forEach((prev) => {
    const u = prods.find((p) => p.id === prev.id);
    if (u) pushProduct(u);
  });
};

export const getBrand = (slug: string) =>
  getBrands().find((b) => b.slug === slug);

export const getRoaster = (slug: string) =>
  getRoasters().find((r) => r.slug === slug);

export const getProduct = (id: string) =>
  getProducts().find((p) => p.id === id);

export const getProductsByRoaster = (slug: string) =>
  getProducts().filter((p) => p.roasterSlug === slug);

export const getProductsByBrand = (slug: string) =>
  getProducts().filter((p) => p.brandSlug === slug);

// Slug helper (Arabic-friendly: keeps letters, replaces spaces)
export const toSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");

// React hook to subscribe to catalog changes
export function useCatalog() {
  const [roasters, setR] = useState<Roaster[]>(() => getRoasters());
  const [products, setP] = useState<Product[]>(() => getProducts());
  const [brands, setB] = useState<EquipmentBrand[]>(() => getBrands());

  useEffect(() => {
    const refresh = () => {
      setR(getRoasters());
      setP(getProducts());
      setB(getBrands());
    };
    window.addEventListener("catalog:changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("catalog:changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { roasters, products, brands };
}
