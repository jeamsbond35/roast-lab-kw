import { Link, useParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCatalog } from "@/lib/supabase/catalog";

const { products, loading } = useCatalog();

export default function RoasterPage() {
  const { slug } = useParams();
  useCatalog(); // re-render on catalog changes
  const roaster = slug ? getRoaster(slug) : undefined;
  const items = slug ? getProductsByRoaster(slug) : [];

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 container mx-auto px-6 py-12">
            {!roaster ? (
              <div className="text-center py-20">
                <h1 className="font-display text-3xl text-primary">المحمصة غير موجودة</h1>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <span className="text-xs tracking-[0.3em] text-accent uppercase">Roaster</span>
                  <h1 className="font-display text-4xl md:text-5xl text-primary mt-3">{roaster.name}</h1>
                  <p className="text-muted-foreground mt-2">{roaster.origin}</p>
                  <p className="text-muted-foreground mt-4 max-w-2xl">{roaster.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
                  {items.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-elegant transition-all">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img src={p.img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-base text-primary">{p.name}</h3>
                        <p className="font-display text-primary mt-2"><span>{p.price.toFixed(3)}</span><span className="text-xs text-muted-foreground mr-1">د.ك</span></p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
