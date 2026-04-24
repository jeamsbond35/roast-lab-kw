import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/data/catalog";

export function ProductGrid() {
  const { add } = useCart();
  const { products: all } = useCatalog();
  const products = all.filter((p) => !!p.name && !!p.img && p.price > 0 && !!p.roasterSlug);
  if (products.length === 0) return null;
  return (
    <section id="products" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs tracking-[0.3em] text-accent uppercase">Our Selection</span>
            <h2 className="font-display text-4xl md:text-5xl text-primary mt-3">منتجاتنا المميزة</h2>
          </div>
          <a href="#" className="hidden md:inline text-sm text-muted-foreground hover:text-primary transition-colors">
            عرض الكل ←
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
          {products.map((p) => (
            <article
              key={p.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-elegant transition-all duration-500"
            >
              <Link to={`/product/${p.id}`} className="relative aspect-square overflow-hidden bg-muted block">
                <img
                  src={p.img}
                  alt={p.name}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {p.tag && (
                  <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">
                    {p.tag}
                  </span>
                )}
              </Link>
              <div className="p-4 md:p-5">
                <Link to={`/roaster/${p.roasterSlug}`} className="text-xs text-muted-foreground hover:text-accent">{p.roaster}</Link>
                <Link to={`/product/${p.id}`}>
                  <h3 className="font-display text-base md:text-lg text-primary mt-1 leading-snug hover:text-accent transition-colors">{p.name}</h3>
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-primary">
                    <span className="text-lg">{p.price.toFixed(3)}</span>
                    <span className="text-xs text-muted-foreground mr-1">د.ك</span>
                  </span>
                  <Button
                    size="icon"
                    onClick={() => {
                      add({ id: p.id, name: p.name, roaster: p.roaster, price: p.price, img: p.img });
                      toast.success("أُضيف إلى السلة", { description: p.name });
                    }}
                    className="h-9 w-9 rounded-full bg-primary hover:bg-accent transition-colors"
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
