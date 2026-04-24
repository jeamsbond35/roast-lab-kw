import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

const SHIPPING = 1.5;
const FREE_SHIPPING_THRESHOLD = 20;

const Cart = () => {
  const { items, subtotal, setQty, remove } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING;
  const total = subtotal + shipping;

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 py-10 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mb-8">
                <span className="text-xs tracking-[0.3em] text-accent uppercase">Your Cart</span>
                <h1 className="font-display text-3xl md:text-4xl text-primary mt-2">سلّة التسوّق</h1>
              </div>

              {items.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
                    <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-xl text-primary">سلّتك فارغة</h2>
                  <p className="text-muted-foreground mt-2">أضف بعض القهوة المختصة لتبدأ رحلتك</p>
                  <Button asChild className="mt-6 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link to="/">تسوّق الآن</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.weight ?? ""}`}
                        className="bg-card border border-border rounded-2xl p-4 md:p-5 flex gap-4"
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          width={120}
                          height={120}
                          loading="lazy"
                          className="h-24 w-24 md:h-28 md:w-28 rounded-xl object-cover bg-muted flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">{item.roaster}</p>
                              <h3 className="font-display text-base md:text-lg text-primary truncate">{item.name}</h3>
                              {item.weight && <p className="text-xs text-muted-foreground mt-0.5">الوزن: {item.weight}</p>}
                            </div>
                            <button
                              onClick={() => remove(item.id, item.weight)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              aria-label="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-auto pt-3 flex items-center justify-between">
                            <div className="flex items-center border border-border rounded-full">
                              <button
                                onClick={() => setQty(item.id, item.weight, item.qty - 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                                aria-label="إنقاص"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center font-medium text-sm">{item.qty}</span>
                              <button
                                onClick={() => setQty(item.id, item.weight, item.qty + 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                                aria-label="زيادة"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="font-display text-primary">
                              <span className="text-lg">{(item.price * item.qty).toFixed(3)}</span>
                              <span className="text-xs text-muted-foreground mr-1">د.ك</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <aside className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 shadow-soft">
                      <h2 className="font-display text-xl text-primary mb-5">ملخّص الطلب</h2>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>المجموع الفرعي</span>
                          <span className="text-foreground font-medium">{subtotal.toFixed(3)} د.ك</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>التوصيل</span>
                          <span className="text-foreground font-medium">
                            {shipping === 0 ? "مجاني" : `${shipping.toFixed(3)} د.ك`}
                          </span>
                        </div>
                        {subtotal < FREE_SHIPPING_THRESHOLD && (
                          <p className="text-xs text-accent bg-accent/10 rounded-lg p-3">
                            أضف {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(3)} د.ك للحصول على توصيل مجاني
                          </p>
                        )}
                      </div>
                      <div className="border-t border-border my-5" />
                      <div className="flex justify-between items-baseline mb-6">
                        <span className="font-display text-primary">الإجمالي</span>
                        <span className="font-display text-2xl text-primary">
                          {total.toFixed(3)} <span className="text-sm text-muted-foreground">د.ك</span>
                        </span>
                      </div>
                      <Button asChild size="lg" className="w-full rounded-full bg-primary hover:bg-accent text-primary-foreground h-12">
                        <Link to="/checkout">
                          إتمام الشراء
                          <ArrowLeft className="mr-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full mt-2">
                        <Link to="/">متابعة التسوّق</Link>
                      </Button>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Cart;
