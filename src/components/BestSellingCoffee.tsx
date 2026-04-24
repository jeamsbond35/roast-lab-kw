import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Flame } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/data/catalog";
import { getOrders } from "@/lib/profileStore";
import type { Product } from "@/lib/catalogStore";

const isComplete = (p: Product) =>
  !p.hidden && !!p.name && !!p.img && p.price > 0 && !!p.roasterSlug;

export function BestSellingCoffee() {
  const { products } = useCatalog();
  const { add } = useCart();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const refresh = () => {
      const c: Record<string, number> = {};
      for (const o of getOrders()) {
        for (const it of o.items) {
          c[it.id] = (c[it.id] ?? 0) + (it.qty ?? 1);
        }
      }
      setCounts(c);
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const coffees = products.filter((p) => p.category === "coffee" && isComplete(p));
  const ranked = [...coffees]
    .map((p) => ({ p, n: counts[p.id] ?? 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 4);

  if (ranked.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs tracking-[0.3em] text-accent uppercase">Best Sellers</span>
            <h2 className="font-display text-3xl md:text-4xl text-primary mt-2 flex items-center gap-2">
              <Flame className="h-7 w-7 text-accent" />
              الأكثر طلباً من محاصيل القهوة
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {ranked.map(({ p, n }, i) => (
            <article key={p.id} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-elegant transition-all duration-500 relative">
              <span className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">
                #{i + 1} · {n} طلب
              </span>
              <Link to={`/product/${p.id}`} className="relative aspect-square overflow-hidden bg-muted block">
                <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </Link>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{p.roaster}</p>
                <Link to={`/product/${p.id}`}>
                  <h3 className="font-display text-base text-primary mt-1 leading-snug hover:text-accent transition-colors line-clamp-2">{p.name}</h3>
                </Link>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-primary">
                    <span className="text-base">{p.price.toFixed(3)}</span>
                    <span className="text-xs text-muted-foreground mr-1">د.ك</span>
                  </span>
                  <Button
                    size="icon"
                    onClick={() => {
                      add({ id: p.id, name: p.name, roaster: p.roaster, price: p.price, img: p.img });
                      toast.success("أُضيف إلى السلة", { description: p.name });
                    }}
                    className="h-8 w-8 rounded-full bg-primary hover:bg-accent transition-colors"
                    aria-label={`أضف ${p.name} للسلة`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
