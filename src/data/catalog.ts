// Compatibility shim: proxies to the dynamic store backed by localStorage.

export type {
  Roaster,
  Product,
  CoffeeType,
  ProductCategory,
} from "@/lib/catalogStore";

import {
  getRoasters,
  getProducts,
  getRoaster as _getRoaster,
  getProduct as _getProduct,
  getProductsByRoaster as _getProductsByRoaster,
  type Product,
} from "@/lib/catalogStore";

export { useCatalog } from "@/lib/catalogStore";

// "Complete" = required public fields are present and not manually hidden.
const isComplete = (p: Product) => {
  if (p.hidden || !p.name || !p.img) return false;
  if (typeof p.price !== "number" || p.price <= 0) return false;
  // Equipment requires brand; coffee/other require roaster
  if (p.category === "equipment") return !!p.brandSlug;
  return !!p.roasterSlug;
};

export const getAllRoasters = () => getRoasters();
export const getPublicProducts = () => getProducts().filter(isComplete);

export const getRoaster = _getRoaster;
export const getProduct = (id: string) => {
  const p = _getProduct(id);
  return p && isComplete(p) ? p : undefined;
};
export const getProductsByRoaster = (slug: string) =>
  _getProductsByRoaster(slug).filter(isComplete);

// Legacy snapshots for non-reactive callers (e.g. dropdown lists at render time).
export const products = getPublicProducts();
export const roasters = getRoasters();
