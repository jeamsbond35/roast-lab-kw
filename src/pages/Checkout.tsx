import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Banknote, CreditCard, CheckCircle2, ArrowLeft } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { addOrder, getProfile, saveProfile, type Order } from "@/lib/profileStore";

const SHIPPING = 1.5;
const FREE_SHIPPING_THRESHOLD = 20;

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم قصير جدًا").max(80, "الاسم طويل جدًا"),
  phone: z.string().trim().regex(/^[0-9+\s-]{8,15}$/, "رقم الهاتف غير صحيح"),
  city: z.string().trim().min(2, "المدينة مطلوبة").max(60),
  block: z.string().trim().min(1, "القطعة مطلوبة").max(20),
  street: z.string().trim().min(1, "الشارع مطلوب").max(60),
  avenue: z.string().trim().max(60).optional().or(z.literal("")),
  house: z.string().trim().min(1, "رقم المنزل مطلوب").max(20),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  payment: z.enum(["cash", "knet"], { required_error: "اختر طريقة الدفع" }),
});

type FormState = {
  fullName: string;
  phone: string;
  city: string;
  block: string;
  street: string;
  avenue: string;
  house: string;
  notes: string;
  payment: "cash" | "knet" | "";
};

const initial: FormState = (() => {
  const p = getProfile();
  return {
    fullName: p.fullName, phone: p.phone, city: p.city, block: p.block,
    street: p.street, avenue: p.avenue, house: p.house, notes: "", payment: "",
  };
})();

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{ orderId: string; total: number; payment: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING;
  const total = subtotal + shipping;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("سلّتك فارغة");
      return;
    }
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      toast.error("راجع الحقول المطلوبة");
      return;
    }
    setSubmitting(true);
    const data = result.data;
    const orderId = "RL-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const prev = getProfile();
    saveProfile({
      ...prev,
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      block: data.block,
      street: data.street,
      avenue: data.avenue ?? "",
      house: data.house,
    });
    const order: Order = {
      id: orderId,
      date: new Date().toISOString(),
      items: items.map((it) => ({ ...it })),
      subtotal,
      shipping,
      total,
      payment: data.payment,
      status: "pending",
      address: {
        city: data.city,
        block: data.block,
        street: data.street,
        avenue: data.avenue ?? "",
        house: data.house,
      },
      notes: data.notes || undefined,
    };
    addOrder(order);
    clear();
    setSubmitted({ orderId, total, payment: data.payment });
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div dir="rtl" className="min-h-screen flex w-full bg-background">
          <CoffeeSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 flex items-center justify-center py-16 px-4">
              <div className="max-w-lg w-full bg-card border border-border rounded-2xl p-10 text-center shadow-card">
                <div className="h-16 w-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-5">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
                <h1 className="font-display text-3xl text-primary">تم استلام طلبك</h1>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  شكرًا لطلبك من Roast Lab KW. سنتواصل معك قريبًا لتأكيد التوصيل.
                </p>
                <div className="mt-6 bg-muted/50 rounded-xl p-5 text-right space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الطلب</span>
                    <span className="font-display text-primary">{submitted.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الإجمالي</span>
                    <span className="font-medium">{submitted.total.toFixed(3)} د.ك</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">طريقة الدفع</span>
                    <span className="font-medium">{submitted.payment === "cash" ? "كاش عند الاستلام" : "كي نت"}</span>
                  </div>
                </div>
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate("/profile")} variant="outline" className="rounded-full px-8">
                    عرض طلباتي
                  </Button>
                  <Button onClick={() => navigate("/")} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground px-8">
                    العودة للرئيسية
                  </Button>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 py-10 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mb-8">
                <Link to="/cart" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5 rotate-180" /> الرجوع للسلة
                </Link>
                <h1 className="font-display text-3xl md:text-4xl text-primary mt-3">إتمام الطلب</h1>
              </div>

              <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact */}
                  <section className="bg-card border border-border rounded-2xl p-6 md:p-7">
                    <h2 className="font-display text-lg text-primary mb-5">معلومات التواصل</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="الاسم الكامل" error={errors.fullName}>
                        <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} maxLength={80} placeholder="مثال: عبدالله الكويتي" />
                      </Field>
                      <Field label="رقم الهاتف" error={errors.phone}>
                        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={15} placeholder="965XXXXXXXX" inputMode="tel" dir="ltr" className="text-right" />
                      </Field>
                    </div>
                  </section>

                  {/* Address */}
                  <section className="bg-card border border-border rounded-2xl p-6 md:p-7">
                    <h2 className="font-display text-lg text-primary mb-5">عنوان التوصيل</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="المدينة / المنطقة" error={errors.city}>
                        <Input value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={60} placeholder="السالمية" />
                      </Field>
                      <Field label="القطعة" error={errors.block}>
                        <Input value={form.block} onChange={(e) => set("block", e.target.value)} maxLength={20} placeholder="5" />
                      </Field>
                      <Field label="الشارع" error={errors.street}>
                        <Input value={form.street} onChange={(e) => set("street", e.target.value)} maxLength={60} placeholder="12" />
                      </Field>
                      <Field label="الجادة (اختياري)" error={errors.avenue}>
                        <Input value={form.avenue} onChange={(e) => set("avenue", e.target.value)} maxLength={60} placeholder="3" />
                      </Field>
                      <Field label="رقم المنزل" error={errors.house} className="sm:col-span-2">
                        <Input value={form.house} onChange={(e) => set("house", e.target.value)} maxLength={20} placeholder="42" />
                      </Field>
                      <Field label="ملاحظات للسائق (اختياري)" error={errors.notes} className="sm:col-span-2">
                        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={300} rows={3} placeholder="علامة مميزة، أوقات التوصيل المفضلة..." />
                      </Field>
                    </div>
                  </section>

                  {/* Payment */}
                  <section className="bg-card border border-border rounded-2xl p-6 md:p-7">
                    <h2 className="font-display text-lg text-primary mb-5">طريقة الدفع</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <PaymentOption
                        active={form.payment === "knet"}
                        onClick={() => set("payment", "knet")}
                        icon={<CreditCard className="h-5 w-5" />}
                        title="كي نت"
                        desc="ادفع مباشرة عبر بطاقة كي نت"
                      />
                      <PaymentOption
                        active={form.payment === "cash"}
                        onClick={() => set("payment", "cash")}
                        icon={<Banknote className="h-5 w-5" />}
                        title="كاش عند الاستلام"
                        desc="ادفع نقدًا عند وصول الطلب"
                      />
                    </div>
                    {errors.payment && <p className="text-xs text-destructive mt-3">{errors.payment}</p>}
                  </section>
                </div>

                {/* Summary */}
                <aside className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 shadow-soft">
                    <h2 className="font-display text-xl text-primary mb-5">ملخّص الطلب</h2>
                    <div className="space-y-3 max-h-60 overflow-auto pl-1 -mr-1">
                      {items.length === 0 && <p className="text-sm text-muted-foreground">لا توجد منتجات في سلّتك.</p>}
                      {items.map((it) => (
                        <div key={`${it.id}-${it.weight ?? ""}`} className="flex gap-3 items-center">
                          <div className="relative flex-shrink-0">
                            <img src={it.img} alt={it.name} width={48} height={48} loading="lazy" className="h-12 w-12 rounded-lg object-cover bg-muted" />
                            <span className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                              {it.qty}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{it.name}</p>
                            <p className="text-[11px] text-muted-foreground">{it.roaster}</p>
                          </div>
                          <span className="text-sm font-medium">{(it.price * it.qty).toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border my-5" />
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>المجموع الفرعي</span>
                        <span className="text-foreground font-medium">{subtotal.toFixed(3)} د.ك</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>التوصيل</span>
                        <span className="text-foreground font-medium">{shipping === 0 ? "مجاني" : `${shipping.toFixed(3)} د.ك`}</span>
                      </div>
                    </div>
                    <div className="border-t border-border my-5" />
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="font-display text-primary">الإجمالي</span>
                      <span className="font-display text-2xl text-primary">
                        {total.toFixed(3)} <span className="text-sm text-muted-foreground">د.ك</span>
                      </span>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || items.length === 0}
                      className="w-full rounded-full bg-primary hover:bg-accent text-primary-foreground h-12"
                    >
                      {submitting ? "جاري التأكيد..." : "تأكيد الطلب"}
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center mt-3">
                      بالضغط على تأكيد الطلب، أنت توافق على شروط البيع لدينا.
                    </p>
                  </div>
                </aside>
              </form>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

function Field({
  label, error, children, className,
}: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}

function PaymentOption({
  active, onClick, icon, title, desc,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-right p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-accent bg-accent/5 shadow-soft"
          : "border-border bg-background hover:border-accent/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-display text-primary">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 mt-1 ${active ? "border-accent bg-accent" : "border-border"}`}>
          {active && <div className="h-full w-full rounded-full bg-accent-foreground scale-[0.4]" />}
        </div>
      </div>
    </button>
  );
}

export default Checkout;
