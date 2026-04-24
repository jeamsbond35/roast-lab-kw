import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/data/catalog";
import { equipmentTypeLabel } from "@/lib/catalogStore";
import { useEffect } from "react";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  v60: { title: "أدوات V60", subtitle: "أدوات التقطير اليدوي V60" },
  grinders: { title: "المطاحن", subtitle: "مطاحن القهوة المنزلية والاحترافية" },
  filters: { title: "الفلاتر", subtitle: "فلاتر الورق والمعدنية" },
  cups: { title: "الأكواب", subtitle: "أكواب القهوة وأكواب السفر" },
};

export default function EquipmentCategory() {
  const { type = "" } = useParams();
  const { add } = useCart();
  const { products } = useCatalog();

  const meta = TITLES[type] ?? { title: equipmentTypeLabel(type), subtitle: "" };
  const list = products.filter(
    (p) => p.category === "equipment" && p.equipmentType === type && !!p.name && !!p.img && p.price > 0,
  );

  useEffect(() => {
    document.title = `${meta.title} | Roast Lab KW`;
  }, [meta.title]);

  return (
    <SidebarProvider defaultOpen={false}>
      <CoffeeSidebar />
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-12">
          <div className="mb-10">
            <span className="text-xs tracking-[0.3em] text-accent uppercase">Equipment</span>
            <h1 className="font-display text-4xl md:text-5xl text-primary mt-3">{meta.title}</h1>
            {meta.subtitle && <p className="text-muted-foreground mt-2">{meta.subtitle}</p>}
          </div>

          {list.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              لا توجد منتجات حالياً في هذا القسم.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {list.map((p) => (
                <article
                  key={p.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-elegant transition-all duration-500"
                >
                  <Link to={`/product/${p.id}`} className="relative aspect-square overflow-hidden bg-muted block">
                    <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    {p.tag && (
                      <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">
                        {p.tag}
                      </span>
                    )}
                  </Link>
                  <div className="p-4 md:p-5">
                    {p.brand && <span className="text-xs text-muted-foreground">{p.brand}</span>}
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
                          add({ id: p.id, name: p.name, roaster: p.brand ?? "", price: p.price, img: p.img });
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
          )}
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
