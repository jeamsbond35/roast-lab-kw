import type { CartItem } from "@/context/CartContext";
import { getOrders, type Order, type Profile } from "@/lib/profileStore";
import { tryGetSupabase } from "@/lib/supabaseClient";

type OrderRow = {
  id: string;
  order_date: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  status: string;
  notes: string | null;
  address: Record<string, string> | null;
};

type LineRow = {
  order_id: string;
  product_id: string;
  name: string;
  roaster: string;
  price: number;
  qty: number;
  weight: string | null;
  img: string | null;
};

function lineToCartItem(row: LineRow): CartItem {
  return {
    id: row.product_id,
    name: row.name,
    roaster: row.roaster,
    price: Number(row.price),
    qty: row.qty,
    weight: row.weight ?? undefined,
    img: row.img ?? "",
  };
}

function orderFromRows(o: OrderRow, items: CartItem[]): Order {
  const addr = o.address ?? {};
  return {
    id: o.id,
    date: o.order_date,
    items,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    total: Number(o.total),
    payment: o.payment as Order["payment"],
    status: o.status as Order["status"],
    address: {
      city: addr.city ?? "",
      block: addr.block ?? "",
      street: addr.street ?? "",
      avenue: addr.avenue ?? "",
      house: addr.house ?? "",
    },
    notes: o.notes ?? undefined,
  };
}

export async function pushOrderToSupabase(order: Order, profile: Profile): Promise<void> {
  const sb = tryGetSupabase();
  if (!sb) return;

  const { data: customer, error: cErr } = await sb
    .from("customers")
    .upsert(
      {
        phone: profile.phone.trim(),
        full_name: profile.fullName.trim(),
        email: profile.email?.trim() || null,
        city: profile.city,
        block: profile.block,
        street: profile.street,
        avenue: profile.avenue || "",
        house: profile.house,
      },
      { onConflict: "phone" },
    )
    .select("id")
    .single();
  if (cErr) {
    console.warn("[supabase] customer", cErr);
    return;
  }
  if (!customer?.id) return;

  const { error: oErr } = await sb.from("orders").upsert(
    {
      id: order.id,
      customer_id: customer.id,
      order_date: order.date,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      payment: order.payment,
      status: order.status,
      notes: order.notes ?? null,
      address: order.address,
    } as never,
    { onConflict: "id" },
  );
  if (oErr) {
    console.warn("[supabase] order", oErr);
    return;
  }

  await sb.from("order_line_items").delete().eq("order_id", order.id);

  const lineRows = order.items.map((it) => ({
    order_id: order.id,
    product_id: it.id,
    name: it.name,
    roaster: it.roaster,
    price: it.price,
    qty: it.qty,
    weight: it.weight ?? null,
    img: it.img,
  }));
  const { error: lErr } = await sb.from("order_line_items").insert(lineRows as never);
  if (lErr) console.warn("[supabase] order_line_items", lErr);
}

export async function fetchAllOrdersForAdmin(): Promise<Order[]> {
  const sb = tryGetSupabase();
  if (!sb) return getOrders();

  const { data: orderRows, error: oE } = await sb
    .from("orders")
    .select("id,order_date,subtotal,shipping,total,payment,status,notes,address")
    .order("order_date", { ascending: false });
  if (oE) {
    console.warn("[supabase] fetch orders", oE);
    return getOrders();
  }
  if (!orderRows?.length) return getOrders();

  const rows = orderRows as OrderRow[];
  const ids = rows.map((r) => r.id);
  const { data: lines, error: lE } = await sb
    .from("order_line_items")
    .select("order_id,product_id,name,roaster,price,qty,weight,img")
    .in("order_id", ids);
  if (lE) {
    console.warn("[supabase] order lines", lE);
    return getOrders();
  }

  const byOrder = new Map<string, LineRow[]>();
  (lines as LineRow[] | null | undefined)?.forEach((row) => {
    if (!byOrder.has(row.order_id)) byOrder.set(row.order_id, []);
    byOrder.get(row.order_id)!.push(row);
  });

  return rows.map((o) => {
    const items = (byOrder.get(o.id) ?? []).map(lineToCartItem);
    return orderFromRows(o, items);
  });
}

export async function fetchOrdersByPhone(phone: string): Promise<Order[] | null> {
  if (!phone.trim()) return null;
  const sb = tryGetSupabase();
  if (!sb) return null;

  const { data: cust } = await sb.from("customers").select("id").eq("phone", phone.trim()).maybeSingle();
  if (!cust?.id) return [];

  const { data: orderRows, error: oE } = await sb
    .from("orders")
    .select("id,order_date,subtotal,shipping,total,payment,status,notes,address")
    .eq("customer_id", (cust as { id: string }).id)
    .order("order_date", { ascending: false });
  if (oE) return null;
  if (!orderRows?.length) return [];

  const rows = orderRows as OrderRow[];
  const ids = rows.map((r) => r.id);
  const { data: lines } = await sb
    .from("order_line_items")
    .select("order_id,product_id,name,roaster,price,qty,weight,img")
    .in("order_id", ids);

  const byOrder = new Map<string, LineRow[]>();
  (lines as LineRow[] | null | undefined)?.forEach((row) => {
    if (!byOrder.has(row.order_id)) byOrder.set(row.order_id, []);
    byOrder.get(row.order_id)!.push(row);
  });

  return rows.map((o) => {
    const items = (byOrder.get(o.id) ?? []).map(lineToCartItem);
    return orderFromRows(o, items);
  });
}
