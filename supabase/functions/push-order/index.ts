import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const payload = await req.json();
    const { order, profile } = payload as any;
    if (!order || !profile) return new Response(JSON.stringify({ error: "Missing order or profile" }), { status: 400 });

    // Upsert customer by phone
    const { data: customer, error: cErr } = await sb
      .from("customers")
      .upsert(
        {
          phone: (profile.phone || "").trim(),
          full_name: (profile.fullName || "").trim(),
          email: profile.email?.trim() || null,
          city: profile.city || "",
          block: profile.block || "",
          street: profile.street || "",
          avenue: profile.avenue || "",
          house: profile.house || "",
        },
        { onConflict: "phone" },
      )
      .select("id")
      .single();

    if (cErr) return new Response(JSON.stringify({ error: cErr }), { status: 500 });
    if (!customer?.id) return new Response(JSON.stringify({ error: "No customer id returned" }), { status: 500 });

    // Upsert order
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
      },
      { onConflict: "id" },
    );
    if (oErr) return new Response(JSON.stringify({ error: oErr }), { status: 500 });

    // Replace line items
    await sb.from("order_line_items").delete().eq("order_id", order.id);
    const lineRows = (order.items || []).map((it: any) => ({
      order_id: order.id,
      product_id: it.id,
      name: it.name,
      roaster: it.roaster,
      price: it.price,
      qty: it.qty,
      weight: it.weight ?? null,
      img: it.img ?? null,
    }));
    const { error: lErr } = await sb.from("order_line_items").insert(lineRows as any);
    if (lErr) return new Response(JSON.stringify({ error: lErr }), { status: 500 });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
});
