import { Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCatalog } from "@/lib/supabase/catalog";

const { products, loading } = useCatalog();

export default function Roasters() {
  const { roasters } = useCatalog();
  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 container mx-auto px-6 py-12">
            <div className="mb-12">
              <span className="text-xs tracking-[0.3em] text-accent uppercase">Our Roasters</span>
              <h1 className="font-display text-4xl md:text-5xl text-primary mt-3">المحامص</h1>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                تصفّح محامصنا المختارة بعناية، كل محمصة لها صفحة خاصة تعرض كامل منتجاتها.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roasters.map((r) => {
                const items = getProductsByRoaster(r.slug);
                const previews = items.slice(0, 3);
                return (
                  <Link
                    key={r.slug}
                    to={`/roaster/${r.slug}`}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-elegant transition-all duration-500 flex flex-col"
                  >
                    <div className="grid grid-cols-3 gap-1 p-1 bg-muted">
                      {previews.length > 0 ? (
                        previews.map((p) => (
                          <div key={p.id} className="aspect-square overflow-hidden rounded-lg bg-background">
                            <img
                              src={p.img}
                              alt={p.name}
                              loading="lazy"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 aspect-[3/1] flex items-center justify-center text-muted-foreground text-sm">
                          لا توجد منتجات بعد
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-xl text-primary group-hover:text-accent transition-colors">
                            {r.name}
                          </h2>
                          <p className="text-xs text-muted-foreground mt-1">{r.origin}</p>
                        </div>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full whitespace-nowrap">
                          {items.length} منتج
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1">
                        {r.description}
                      </p>
                      <span className="mt-4 text-sm text-accent">عرض المنتجات ←</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
