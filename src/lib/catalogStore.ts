import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { supabase } from "@/lib/supabase.ts";

export type Product = {
  id: string;
  category: string;
  name: string;
  roasterSlug: string;
  roaster: string;
  price: number;
  weight?: string;
  img: string;
  tag?: string;
  details?: string;
  qty?: number;

  coffeeType?: string;
  origin?: string;
  altitude?: string;
  variety?: string;
  process?: string;
  notes?: string;
};

export type Roaster = {
  slug: string;
  name: string;
  origin: string;
  description: string;
  logo?: string;
};

// 🔥 PRODUCTS
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return [];
  return data || [];
};

export const fetchProduct = async (id: string): Promise<Product | null> => {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return data || null;
};

export const fetchProductsByRoaster = async (slug: string) => {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("roasterSlug", slug);

  return data || [];
};

// 🔥 ROASTERS
export const fetchRoasters = async (): Promise<Roaster[]> => {
  const { data } = await supabase.from("roasters").select("*");
  return data || [];
};

// 🔥 REACT HOOK (REALTIME SIMPLE)
export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [roasters, setRoasters] = useState<Roaster[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      fetchProducts(),
      fetchRoasters(),
    ]);
    setProducts(p);
    setRoasters(r);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("catalog")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, roasters, loading, refresh: load };
}
