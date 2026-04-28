import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  if (error) {
    console.error(error.message);
    return [];
  }

  return data ?? [];
};

// 🔥 ROASTERS
export const fetchRoasters = async (): Promise<Roaster[]> => {
  const { data, error } = await supabase.from("roasters").select("*");

  if (error) {
    console.error(error.message);
    return [];
  }

  return data ?? [];
};

// 🔥 HOOK
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
        { event: "INSERT", schema: "public", table: "products" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "products" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, roasters, loading, refresh: load };
}
