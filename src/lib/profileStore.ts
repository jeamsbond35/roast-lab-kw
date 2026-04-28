import type { CartItem } from "@/context/CartContext";
import { isSupabaseEnabled } from "@/lib/supabaseClient";
import { pushOrderToSupabase } from "@/lib/supabase/ordersSync";

export type Profile = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  block: string;
  street: string;
  avenue: string;
  house: string;
};

export type Order = {
  id: string;
  date: string; // ISO
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: "cash" | "knet";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address: Omit<Profile, "fullName" | "email" | "phone">;
  notes?: string;
};

const PROFILE_KEY = "roastlab_profile_v1";
const ORDERS_KEY = "roastlab_orders_v1";

const emptyProfile: Profile = {
  fullName: "", email: "", phone: "", city: "", block: "", street: "", avenue: "", house: "",
};

export function getProfile(): Profile {
  if (typeof window === "undefined") return emptyProfile;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...emptyProfile, ...JSON.parse(raw) } : emptyProfile;
  } catch {
    return emptyProfile;
  }
}

export function saveProfile(p: Profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const arr = raw ? (JSON.parse(raw) as Order[]) : [];
    return arr.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  } catch {
    return [];
  }
}

export function addOrder(order: Order) {
  try {
    const list = getOrders();
    list.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  } catch {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orders:changed"));
  }
  if (typeof window !== "undefined" && isSupabaseEnabled()) {
    const fnUrl = (import.meta.env.VITE_SUPABASE_FUNCTION_URL as string | undefined)?.trim();
    if (fnUrl) {
      fetch(fnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, profile: getProfile() }),
      }).catch((e) => console.warn("[supabase] function", e));
    } else {
      void pushOrderToSupabase(order, getProfile());
    }
  }
}
