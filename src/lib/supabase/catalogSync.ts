import {
  getBrands,
  getProducts,
  getRoasters,
  saveBrands,
  saveProducts,
  saveRoasters,
  type EquipmentBrand,
  type Product,
  type ProductCategory,
  type Roaster,
} from "@/lib/catalogStore";
import { tryGetSupabase } from "@/lib/supabaseClient";

type ProductRow = {
  id: string;
  category: string;
  name: string;
  roaster_slug: string;
  roaster: string;
  price: number;
  cost: number | null;
  weight: string | null;
  img: string;
  tag: string | null;
  details: string | null;
  qty: number | null;
  coffee_type: string | null;
  coffee_origin: string | null;
  altitude: string | null;
  variety: string | null;
  process: string | null;
  notes: string | null;
  hidden: boolean | null;
  brand_slug: string | null;
  brand: string | null;
  equipment_type: string | null;
};

function productToRow(p: Product): Record<string, unknown> {
  return {
    id: p.id,
    category: p.category,
    name: p.name,
    roaster_slug: p.roasterSlug || "",
    roaster: p.roaster || "",
    price: p.price,
    cost: p.cost ?? null,
    weight: p.weight ?? null,
    img: p.img,
    tag: p.tag ?? null,
    details: p.details ?? null,
    qty: p.qty ?? null,
    coffee_type: p.coffeeType ?? null,
    coffee_origin: p.origin ?? null,
    altitude: p.altitude ?? null,
    variety: p.variety ?? null,
    process: p.process ?? null,
    notes: p.notes ?? null,
    hidden: p.hidden ?? false,
    brand_slug: p.brandSlug ?? null,
    brand: p.brand ?? null,
    equipment_type: p.equipmentType ?? null,
  };
}

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    category: r.category as ProductCategory,
    name: r.name,
    roasterSlug: r.roaster_slug ?? "",
    roaster: r.roaster ?? "",
    price: Number(r.price),
    cost: r.cost != null ? Number(r.cost) : undefined,
    weight: r.weight ?? undefined,
    img: r.img,
    tag: r.tag ?? undefined,
    details: r.details ?? undefined,
    qty: r.qty != null ? r.qty : undefined,
    coffeeType: (r.coffee_type as Product["coffeeType"]) ?? undefined,
    origin: r.coffee_origin ?? undefined,
    altitude: r.altitude ?? undefined,
    variety: r.variety ?? undefined,
    process: r.process ?? undefined,
    notes: r.notes ?? undefined,
    hidden: r.hidden ?? false,
    brandSlug: r.brand_slug ?? undefined,
    brand: r.brand ?? undefined,
    equipmentType: r.equipment_type ?? undefined,
  };
}

function mergeBy<T extends { slug: string }>(local: T[], remote: T[], key: (t: T) => string): T[] {
  const m = new Map<string, T>();
  local.forEach((x) => m.set(key(x), x));
  remote.forEach((x) => m.set(key(x), x));
  return [...m.values()];
}

function mergeProducts(local: Product[], remote: Product[]): Product[] {
  const m = new Map<string, Product>();
  local.forEach((x) => m.set(x.id, x));
  remote.forEach((x) => m.set(x.id, x));
  return [...m.values()];
}

export async function mergeCatalogFromSupabase(): Promise<void> {
  const sb = tryGetSupabase();
  if (!sb) return;

  const [rRes, bRes, pRes] = await Promise.all([
    sb.from("roasters").select("*"),
    sb.from("equipment_brands").select("*"),
    sb.from("products").select("*"),
  ]);
  if (rRes.error) console.warn("[supabase] roasters", rRes.error);
  if (bRes.error) console.warn("[supabase] equipment_brands", bRes.error);
  if (pRes.error) console.warn("[supabase] products", pRes.error);

  if (rRes.data?.length) {
    const remote = (rRes.data as Roaster[]).map((x) => ({
      slug: x.slug,
      name: x.name,
      origin: x.origin,
      description: x.description,
      logo: x.logo,
    }));
    saveRoasters(mergeBy(getRoasters(), remote, (t) => t.slug));
  }
  if (bRes.data?.length) {
    const remote = (bRes.data as EquipmentBrand[]).map((x) => ({
      slug: x.slug,
      name: x.name,
      description: x.description,
      logo: x.logo,
    }));
    saveBrands(mergeBy(getBrands(), remote, (t) => t.slug));
  }
  if (pRes.data?.length) {
    const remote = (pRes.data as ProductRow[]).map(rowToProduct);
    saveProducts(mergeProducts(getProducts(), remote));
  }
}

export function pushRoaster(r: Roaster): void {
  const sb = tryGetSupabase();
  if (!sb) return;
  void sb
    .from("roasters")
    .upsert(
      { slug: r.slug, name: r.name, origin: r.origin, description: r.description, logo: r.logo ?? null },
      { onConflict: "slug" },
    )
    .then(({ error }) => {
      if (error) console.warn("[supabase] push roaster", error);
    });
}

export function pushBrand(b: EquipmentBrand): void {
  const sb = tryGetSupabase();
  if (!sb) return;
  void sb
    .from("equipment_brands")
    .upsert(
      { slug: b.slug, name: b.name, description: b.description ?? null, logo: b.logo ?? null },
      { onConflict: "slug" },
    )
    .then(({ error }) => {
      if (error) console.warn("[supabase] push brand", error);
    });
}

export function pushProduct(p: Product): void {
  const sb = tryGetSupabase();
  if (!sb) return;
  void sb
    .from("products")
    .upsert(productToRow(p) as never, { onConflict: "id" })
    .then(({ error }) => {
      if (error) console.warn("[supabase] push product", error);
    });
}

export function deleteProductRemote(id: string): void {
  const sb = tryGetSupabase();
  if (!sb) return;
  void sb
    .from("products")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) console.warn("[supabase] delete product", error);
    });
}

export function deleteRoasterRemote(slug: string, productIds: string[]): void {
  const sb = tryGetSupabase();
  if (!sb) return;
  if (productIds.length) {
    void sb
      .from("products")
      .delete()
      .in("id", productIds)
      .then(({ error }) => {
        if (error) console.warn("[supabase] delete products for roaster", error);
      });
  }
  void sb
    .from("roasters")
    .delete()
    .eq("slug", slug)
    .then(({ error }) => {
      if (error) console.warn("[supabase] delete roaster", error);
    });
}

export function deleteBrandRemote(slug: string): void {
  const sb = tryGetSupabase();
  if (!sb) return;
  void sb
    .from("equipment_brands")
    .delete()
    .eq("slug", slug)
    .then(({ error }) => {
      if (error) console.warn("[supabase] delete brand", error);
    });
}
