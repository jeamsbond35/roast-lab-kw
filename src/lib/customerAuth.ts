// Lightweight phone-based customer "login" (local-only, no real auth).
// For real authentication, enable Lovable Cloud.
import { useEffect, useState } from "react";
import { getProfile, saveProfile } from "@/lib/profileStore";

const KEY = "rl_customer_phone_v1";
const EVT = "customer-auth:changed";

export const getCurrentPhone = (): string | null => {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const loginWithPhone = (phone: string) => {
  const clean = phone.trim();
  localStorage.setItem(KEY, clean);
  // ensure profile has the phone saved
  const p = getProfile();
  if (p.phone !== clean) saveProfile({ ...p, phone: clean });
  window.dispatchEvent(new Event(EVT));
};

export const logout = () => {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
};

export function useCustomerAuth() {
  const [phone, setPhone] = useState<string | null>(() => getCurrentPhone());
  useEffect(() => {
    const refresh = () => setPhone(getCurrentPhone());
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return { phone, isAuthed: !!phone };
}
