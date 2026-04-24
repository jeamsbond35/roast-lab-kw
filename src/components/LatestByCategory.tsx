import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/data/catalog";
import { equipmentTypeLabel, type Product } from "@/lib/catalogStore";

const isComplete = (p: Product) =>
  !p.hidden && !!p.name && !!p.img && p.price > 0 &&
  (p.category === "equipment" ? !!p.brandSlug : !!p.roasterSlug);

function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  return (
    <article className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-elegant transition-all duration-500">
      <Link to={`/product/${p.id}`} className="relative aspect-square overflow-hidden bg-muted block">
        <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </Link>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{p.category === "equipment" ? p.brand : p.roaster}</p>
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
  );
}

function Row({ title, kicker, link, items }: { title: string; kicker?: string; link?: string; items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-5">
        <div>
          {kicker && <span className="text-[11px] tracking-[0.3em] text-accent uppercase">{kicker}</span>}
          <h3 className="font-display text-2xl md:text-3xl text-primary mt-1">{title}</h3>
        </div>
        {link && (
          <Link to={link} className="text-sm text-muted-foreground hover:text-accent transition-colors">
            عرض الكل ←
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}

export function LatestByCategory() {
  const { products } = useCatalog();
  const visible = products.filter(isComplete);
  // newest first by id (timestamp-based)
  const sorted = [...visible].sort((a, b) => (b.id > a.id ? 1 : -1));

  const latest = (filter: (p: Product) => boolean, n = 4) => sorted.filter(filter).slice(0, n);

  const coffee = latest((p) => p.category === "coffee");
  const v60 = latest((p) => p.category === "equipment" && p.equipmentType === "v60");
  const grinders = latest((p) => p.category === "equipment" && p.equipmentType === "grinders");
  const filters = latest((p) => p.category === "equipment" && p.equipmentType === "filters");
  const cups = latest((p) => p.category === "equipment" && p.equipmentType === "cups");

  if (visible.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.3em] text-accent uppercase">New Arrivals</span>
          <h2 className="font-display text-3xl md:text-4xl text-primary mt-2">أحدث الإضافات</h2>
        </div>
        <Row title="محاصيل القهوة" link="/#products" items={coffee} />
        <Row title={equipmentTypeLabel("v60")} link="/equipment/v60" items={v60} />
        <Row title={equipmentTypeLabel("grinders")} link="/equipment/grinders" items={grinders} />
        <Row title={equipmentTypeLabel("filters")} link="/equipment/filters" items={filters} />
        <Row title={equipmentTypeLabel("cups")} link="/equipment/cups" items={cups} />
      </div>
    </section>
  );
}
