import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { z } from "zod";
import { User, Package, MapPin, Save, ChevronDown, ShoppingBag, LogOut } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { getProfile, saveProfile, getOrders, type Profile, type Order } from "@/lib/profileStore";
import { useCustomerAuth, logout } from "@/lib/customerAuth";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم قصير جدًا").max(80),
  email: z.string().trim().email("بريد غير صحيح").or(z.literal("")),
  phone: z.string().trim().regex(/^[0-9+\s-]{8,15}$/, "رقم الهاتف غير صحيح"),
  city: z.string().trim().min(2, "المدينة مطلوبة").max(60),
  block: z.string().trim().min(1, "القطعة مطلوبة").max(20),
  street: z.string().trim().min(1, "الشارع مطلوب").max(60),
  avenue: z.string().trim().max(60).optional().or(z.literal("")),
  house: z.string().trim().min(1, "رقم المنزل مطلوب").max(20),
});

const statusLabel: Record<Order["status"], string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكَّد",
  shipped: "قيد التوصيل",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};

const statusVariant: Record<Order["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-accent/15 text-accent",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

export default function ProfilePage() {
  const { isAuthed } = useCustomerAuth();
  const [profile, setProfile] = useState<Profile>(getProfile());
  const [orders, setOrders] = useState<Order[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);

  useEffect(() => { setOrders(getOrders()); }, []);

  const totalSpent = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);

  if (!isAuthed) return <Navigate to="/login" replace />;

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setProfile((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; });
  };

  const handleSave = () => {
    const r = profileSchema.safeParse(profile);
    if (!r.success) {
      const f: Record<string, string> = {};
      r.error.issues.forEach((i) => { const k = i.path[0] as string; if (!f[k]) f[k] = i.message; });
      setErrors(f);
      toast.error("راجع الحقول المطلوبة");
      return;
    }
    saveProfile(profile);
    setEditing(false);
    toast.success("تم حفظ بياناتك");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 py-10 md:py-14">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
              {/* Header card */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8 flex items-center gap-5">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-display text-2xl md:text-3xl text-primary truncate">
                    {profile.fullName || "مرحبًا بك"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">{profile.email || profile.phone || "أكمل بياناتك للمتابعة بسرعة"}</p>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-muted-foreground">إجمالي المشتريات</p>
                  <p className="font-display text-2xl text-primary mt-1">
                    {totalSpent.toFixed(3)} <span className="text-sm text-muted-foreground">د.ك</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{orders.length} طلب</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { logout(); toast.success("تم تسجيل الخروج"); }}
                  className="rounded-full"
                >
                  <LogOut className="h-4 w-4 ml-1.5" /> خروج
                </Button>
              </div>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="info"><User className="h-4 w-4 ml-2" />بياناتي</TabsTrigger>
                  <TabsTrigger value="orders"><Package className="h-4 w-4 ml-2" />طلباتي ({orders.length})</TabsTrigger>
                </TabsList>

                {/* Info */}
                <TabsContent value="info" className="mt-6">
                  <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-lg text-primary">المعلومات الشخصية</h2>
                      {!editing ? (
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-full">تعديل</Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setProfile(getProfile()); setErrors({}); setEditing(false); }} className="rounded-full">إلغاء</Button>
                          <Button size="sm" onClick={handleSave} className="rounded-full bg-primary hover:bg-accent">
                            <Save className="h-4 w-4 ml-1.5" />حفظ
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="الاسم الكامل" error={errors.fullName}>
                        <Input disabled={!editing} value={profile.fullName} onChange={(e) => set("fullName", e.target.value)} maxLength={80} />
                      </Field>
                      <Field label="البريد الإلكتروني" error={errors.email}>
                        <Input disabled={!editing} value={profile.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" className="text-right" />
                      </Field>
                      <Field label="رقم الهاتف" error={errors.phone}>
                        <Input disabled={!editing} value={profile.phone} onChange={(e) => set("phone", e.target.value)} maxLength={15} dir="ltr" className="text-right" />
                      </Field>
                    </div>

                    <div className="flex items-center gap-2 mt-8 mb-4">
                      <MapPin className="h-4 w-4 text-accent" />
                      <h3 className="font-display text-primary">عنوان التوصيل الافتراضي</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="المدينة / المنطقة" error={errors.city}>
                        <Input disabled={!editing} value={profile.city} onChange={(e) => set("city", e.target.value)} />
                      </Field>
                      <Field label="القطعة" error={errors.block}>
                        <Input disabled={!editing} value={profile.block} onChange={(e) => set("block", e.target.value)} />
                      </Field>
                      <Field label="الشارع" error={errors.street}>
                        <Input disabled={!editing} value={profile.street} onChange={(e) => set("street", e.target.value)} />
                      </Field>
                      <Field label="الجادة (اختياري)" error={errors.avenue}>
                        <Input disabled={!editing} value={profile.avenue} onChange={(e) => set("avenue", e.target.value)} />
                      </Field>
                      <Field label="رقم المنزل" error={errors.house} className="sm:col-span-2">
                        <Input disabled={!editing} value={profile.house} onChange={(e) => set("house", e.target.value)} />
                      </Field>
                    </div>
                  </section>
                </TabsContent>

                {/* Orders */}
                <TabsContent value="orders" className="mt-6">
                  {orders.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                      <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-display text-xl text-primary">لا توجد طلبات بعد</h3>
                      <p className="text-sm text-muted-foreground mt-2">ابدأ بتصفح منتجاتنا المختارة بعناية.</p>
                      <Button asChild className="mt-5 rounded-full bg-primary hover:bg-accent">
                        <Link to="/#products">تصفّح المنتجات</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((o) => (
                        <Collapsible key={o.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                          <CollapsibleTrigger className="w-full p-5 md:p-6 flex items-center gap-4 text-right hover:bg-muted/30 transition-colors group">
                            <div className="h-11 w-11 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-primary">طلب #{o.id}</span>
                                <Badge className={`${statusVariant[o.status]} border-0 text-[10px]`}>{statusLabel[o.status]}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(o.date).toLocaleDateString("ar-KW", { year: "numeric", month: "long", day: "numeric" })}
                                {" · "}
                                {o.items.reduce((s, i) => s + i.qty, 0)} منتج
                              </p>
                            </div>
                            <div className="text-left">
                              <p className="font-display text-primary">{o.total.toFixed(3)} <span className="text-xs text-muted-foreground">د.ك</span></p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{o.payment === "cash" ? "كاش" : "كي نت"}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t border-border p-5 md:p-6 bg-muted/20 space-y-5">
                              <div className="space-y-3">
                                {o.items.map((it) => (
                                  <div key={`${it.id}-${it.weight ?? ""}`} className="flex gap-3 items-center">
                                    <img src={it.img} alt={it.name} className="h-14 w-14 rounded-lg object-cover bg-muted flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{it.name}</p>
                                      <p className="text-xs text-muted-foreground">{it.roaster} · الكمية: {it.qty}</p>
                                    </div>
                                    <span className="text-sm font-medium">{(it.price * it.qty).toFixed(3)} د.ك</span>
                                  </div>
                                ))}
                              </div>

                              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1.5">عنوان التوصيل</p>
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {o.address.city}، قطعة {o.address.block}، شارع {o.address.street}
                                    {o.address.avenue && `، جادة ${o.address.avenue}`}، منزل {o.address.house}
                                  </p>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي</span><span className="text-foreground">{o.subtotal.toFixed(3)} د.ك</span></div>
                                  <div className="flex justify-between text-muted-foreground"><span>التوصيل</span><span className="text-foreground">{o.shipping === 0 ? "مجاني" : `${o.shipping.toFixed(3)} د.ك`}</span></div>
                                  <div className="flex justify-between font-display text-primary pt-1.5 border-t border-border/60"><span>الإجمالي</span><span>{o.total.toFixed(3)} د.ك</span></div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}
