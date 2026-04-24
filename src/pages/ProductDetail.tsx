import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCatalog, getProduct, getProductsByRoaster } from "@/data/catalog";

export default function ProductDetail() {
  const { id } = useParams();
  useCatalog(); // subscribe to catalog updates
  const product = id ? getProduct(id) : undefined;
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div dir="rtl" className="min-h-screen flex w-full bg-background">
          <CoffeeSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 container mx-auto px-6 py-20 text-center">
              <h1 className="font-display text-3xl text-primary">المنتج غير موجود</h1>
              <Link to="/" className="text-accent hover:underline mt-4 inline-block">العودة للرئيسية</Link>
            </main>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const related = getProductsByRoaster(product.roasterSlug).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-6 py-10">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="h-4 w-4" /> العودة
              </Link>

              <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
                  <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
                </div>

                <div>
                  <Link to={`/roaster/${product.roasterSlug}`} className="text-xs tracking-[0.3em] text-accent uppercase hover:underline">
                    {product.roaster}
                  </Link>
                  <h1 className="font-display text-3xl md:text-4xl text-primary mt-3">{product.name}</h1>
                  {product.tag && <Badge className="mt-3 bg-accent text-accent-foreground">{product.tag}</Badge>}

                  <div className="mt-6 font-display text-primary">
                    <span className="text-3xl">{product.price.toFixed(3)}</span>
                    <span className="text-sm text-muted-foreground mr-2">د.ك</span>
                  </div>

                  {product.details && (
                    <p className="mt-6 text-muted-foreground leading-relaxed">{product.details}</p>
                  )}

                  {(() => {
                    const coffeeTypeLabel: Record<string, string> = {
                      filter: "فلتر",
                      espresso: "اسبريسو",
                      omni: "أومني",
                    };
                    const fields: { label: string; value?: string }[] = [
                      { label: "المنشأ", value: product.origin },
                      { label: "الوزن", value: product.weight },
                      { label: "نوع القهوة", value: product.coffeeType ? coffeeTypeLabel[product.coffeeType] : undefined },
                      { label: "الارتفاع", value: product.altitude },
                      { label: "السلالة", value: product.variety },
                      { label: "المعالجة", value: product.process },
                      { label: "الإيحاءات", value: product.notes },
                    ].filter((f) => f.value && String(f.value).trim() !== "");

                    if (fields.length === 0) return null;
                    return (
                      <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
                        {fields.map((f) => (
                          <div key={f.label} className="bg-muted/40 rounded-lg p-3">
                            <dt className="text-xs text-muted-foreground">{f.label}</dt>
                            <dd className="text-primary mt-1">{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    );
                  })()}

                  {product.qty === 0 ? (
                    <div className="mt-8">
                      <div className="rounded-full border border-destructive/40 bg-destructive/10 text-destructive text-center py-3 font-display">
                        نفذت الكمية
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-full">
                        <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))} className="rounded-full h-10 w-10">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-display text-primary">{qty}</span>
                        <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)} className="rounded-full h-10 w-10">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => {
                          add({ id: product.id, name: product.name, roaster: product.roaster, price: product.price, img: product.img, weight: product.weight }, qty);
                          toast.success("أُضيف إلى السلة", { description: `${product.name} × ${qty}` });
                        }}
                        className="flex-1 h-12 rounded-full bg-primary hover:bg-accent"
                      >
                        <ShoppingBag className="h-4 w-4 ml-2" /> أضف إلى السلة
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {related.length > 0 && (
                <section className="mt-20">
                  <h2 className="font-display text-2xl text-primary mb-6">من نفس المحمصة</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {related.map((p) => (
                      <Link key={p.id} to={`/product/${p.id}`} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-elegant transition-all">
                        <div className="aspect-square overflow-hidden bg-muted">
                          <img src={p.img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-muted-foreground">{p.roaster}</p>
                          <h3 className="font-display text-base text-primary mt-1">{p.name}</h3>
                          <p className="font-display text-primary mt-2"><span>{p.price.toFixed(3)}</span><span className="text-xs text-muted-foreground mr-1">د.ك</span></p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
