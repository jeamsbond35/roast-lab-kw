import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Plus, Pencil, Trash2, Image as ImageIcon, Coffee, Store, LogOut, BarChart3, PackageX, Eye, EyeOff, TrendingUp, ShoppingCart, Wrench } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useCatalog, upsertRoaster, deleteRoaster, upsertProduct, deleteProduct,
  upsertBrand, deleteBrand,
  toSlug, EQUIPMENT_TYPES, equipmentTypeLabel,
  type Roaster, type Product, type CoffeeType, type ProductCategory,
  type EquipmentBrand, type EquipmentType,
} from "@/lib/catalogStore";
import { getOrders, type Order } from "@/lib/profileStore";
import { isSupabaseEnabled } from "@/lib/supabaseClient";
import { fetchAllOrdersForAdmin } from "@/lib/supabase/ordersSync";

const ADMIN_PASS_KEY = "rl_admin_authed_v1";
const ADMIN_PASSWORD = "admin123"; // يمكن تغييرها لاحقاً عند ربط Cloud

// ---------------- Auth gate ----------------
function AdminLogin({ onOk }: { onOk: () => void }) {
  const [pwd, setPwd] = useState("");
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-card">
        <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h1 className="font-display text-2xl text-primary text-center mt-4">لوحة الأدمن</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">أدخل كلمة المرور للمتابعة</p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pwd === ADMIN_PASSWORD) {
              sessionStorage.setItem(ADMIN_PASS_KEY, "1");
              onOk();
            } else {
              toast.error("كلمة المرور غير صحيحة");
            }
          }}
        >
          <Input
            type="password"
            placeholder="••••••••"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full bg-primary hover:bg-accent">دخول</Button>
        </form>
        <p className="text-[11px] text-muted-foreground text-center mt-4">
          حماية مؤقتة. للحماية الكاملة فعّل Lovable Cloud.
        </p>
      </div>
    </div>
  );
}

// ---------------- Image to dataURL ----------------
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ---------------- Roaster Form ----------------
function RoasterDialog({
  trigger, initial, onSaved,
}: { trigger: React.ReactNode; initial?: Roaster; onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [logo, setLogo] = useState(initial?.logo ?? "");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setOrigin(initial?.origin ?? "");
      setDescription(initial?.description ?? "");
      setLogo(initial?.logo ?? "");
    }
  }, [open, initial]);

  const submit = () => {
    if (!name.trim()) return toast.error("اسم المحمصة مطلوب");
    const slug = initial?.slug ?? toSlug(name);
    if (!slug) return toast.error("لا يمكن إنشاء معرّف صالح من الاسم");
    upsertRoaster({ slug, name: name.trim(), origin: origin.trim(), description: description.trim(), logo: logo || undefined });
    toast.success("تم الحفظ");
    setOpen(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            {initial ? "تعديل محمصة" : "إضافة محمصة"}
          </DialogTitle>
        </DialogHeader>
        <Table className="border border-border rounded-lg">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[min(42%,200px)] text-right text-muted-foreground">البيان</TableHead>
              <TableHead className="text-right text-muted-foreground">القيمة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">اسم المحمصة *</TableCell>
              <TableCell><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">المصدر / البلد</TableCell>
              <TableCell><Input value={origin} onChange={(e) => setOrigin(e.target.value)} maxLength={80} className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">وصف مختصر</TableCell>
              <TableCell><Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">شعار (اختياري)</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-3">
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (f) setLogo(await fileToDataURL(f));
                  }} />
                  {logo && <img src={logo} alt="logo" className="h-12 w-12 rounded object-cover border border-border shrink-0" />}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DialogFooter>
          <Button onClick={submit} className="bg-primary hover:bg-accent">حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Brand Form (Equipment Brands) ----------------
function BrandDialog({
  trigger, initial, onSaved,
}: { trigger: React.ReactNode; initial?: EquipmentBrand; onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [logo, setLogo] = useState(initial?.logo ?? "");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setLogo(initial?.logo ?? "");
    }
  }, [open, initial]);

  const submit = () => {
    if (!name.trim()) return toast.error("اسم الماركة مطلوب");
    const slug = initial?.slug ?? toSlug(name);
    if (!slug) return toast.error("لا يمكن إنشاء معرّف صالح من الاسم");
    upsertBrand({ slug, name: name.trim(), description: description.trim() || undefined, logo: logo || undefined });
    toast.success("تم الحفظ");
    setOpen(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            {initial ? "تعديل ماركة" : "إضافة ماركة معدات"}
          </DialogTitle>
        </DialogHeader>
        <Table className="border border-border rounded-lg">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[min(42%,200px)] text-right text-muted-foreground">البيان</TableHead>
              <TableHead className="text-right text-muted-foreground">القيمة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">اسم الماركة *</TableCell>
              <TableCell><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Hario, Comandante, Fellow..." className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">وصف مختصر</TableCell>
              <TableCell><Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">شعار (اختياري)</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-3">
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (f) setLogo(await fileToDataURL(f));
                  }} />
                  {logo && <img src={logo} alt="logo" className="h-12 w-12 rounded object-cover border border-border shrink-0" />}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DialogFooter>
          <Button onClick={submit} className="bg-primary hover:bg-accent">حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Product Form ----------------
function ProductDialog({
  trigger, initial, roasters, brands, onSaved,
}: {
  trigger: React.ReactNode;
  initial?: Product;
  roasters: Roaster[];
  brands: EquipmentBrand[];
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "coffee");
  const [name, setName] = useState(initial?.name ?? "");
  const [roasterSlug, setRoasterSlug] = useState(initial?.roasterSlug ?? roasters[0]?.slug ?? "");
  const [brandSlug, setBrandSlug] = useState(initial?.brandSlug ?? brands[0]?.slug ?? "");
  const [equipmentType, setEquipmentType] = useState<EquipmentType | "">((initial?.equipmentType as EquipmentType) ?? "");
  const [price, setPrice] = useState<string>(initial?.price?.toString() ?? "");
  const [cost, setCost] = useState<string>(initial?.cost?.toString() ?? "");
  const [weight, setWeight] = useState(initial?.weight ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [qty, setQty] = useState<string>(initial?.qty?.toString() ?? "");
  const [img, setImg] = useState(initial?.img ?? "");
  // coffee
  const [coffeeType, setCoffeeType] = useState<CoffeeType | "">((initial?.coffeeType as CoffeeType) ?? "");
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [altitude, setAltitude] = useState(initial?.altitude ?? "");
  const [variety, setVariety] = useState(initial?.variety ?? "");
  const [process, setProcess] = useState(initial?.process ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  useEffect(() => {
    if (!open) return;
    setCategory(initial?.category ?? "coffee");
    setName(initial?.name ?? "");
    setRoasterSlug(initial?.roasterSlug ?? roasters[0]?.slug ?? "");
    setBrandSlug(initial?.brandSlug ?? brands[0]?.slug ?? "");
    setEquipmentType((initial?.equipmentType as EquipmentType) ?? "");
    setPrice(initial?.price?.toString() ?? "");
    setCost(initial?.cost?.toString() ?? "");
    setWeight(initial?.weight ?? "");
    setTag(initial?.tag ?? "");
    setDetails(initial?.details ?? "");
    setQty(initial?.qty?.toString() ?? "");
    setImg(initial?.img ?? "");
    setCoffeeType((initial?.coffeeType as CoffeeType) ?? "");
    setOrigin(initial?.origin ?? "");
    setAltitude(initial?.altitude ?? "");
    setVariety(initial?.variety ?? "");
    setProcess(initial?.process ?? "");
    setNotes(initial?.notes ?? "");
  }, [open, initial, roasters]);

  const submit = () => {
    if (!name.trim()) return toast.error("اسم المنتج مطلوب");
    const priceN = parseFloat(price);
    if (!Number.isFinite(priceN) || priceN <= 0) return toast.error("سعر بيع غير صالح");
    if (!img) return toast.error("صورة المنتج مطلوبة");

    const isEquipment = category === "equipment";
    if (isEquipment && !brandSlug) return toast.error("اختر الماركة");
    if (!isEquipment && !roasterSlug) return toast.error("اختر المحمصة");

    const costN = cost ? parseFloat(cost) : undefined;
    const qtyN = qty ? parseInt(qty, 10) : undefined;
    const roaster = roasters.find((r) => r.slug === roasterSlug);
    const brand = brands.find((b) => b.slug === brandSlug);

    const id = initial?.id ?? `p_${Date.now().toString(36)}`;
    const product: Product = {
      id,
      category,
      name: name.trim(),
      // For equipment: keep roaster blank. For others: required.
      roasterSlug: isEquipment ? "" : roasterSlug,
      roaster: isEquipment ? "" : (roaster?.name ?? ""),
      price: priceN,
      cost: costN,
      weight: weight.trim() || undefined,
      img,
      tag: tag.trim() || undefined,
      details: details.trim() || undefined,
      qty: qtyN,
      ...(category === "coffee"
        ? {
            coffeeType: (coffeeType || undefined) as CoffeeType | undefined,
            origin: origin.trim() || undefined,
            altitude: altitude.trim() || undefined,
            variety: variety.trim() || undefined,
            process: process.trim() || undefined,
            notes: notes.trim() || undefined,
          }
        : {}),
      ...(isEquipment
        ? {
            brandSlug,
            brand: brand?.name,
            equipmentType: (equipmentType || undefined) as EquipmentType | undefined,
          }
        : {}),
    };
    upsertProduct(product);
    toast.success("تم الحفظ");
    setOpen(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            {initial ? "تعديل منتج" : "إضافة منتج"}
          </DialogTitle>
        </DialogHeader>

        <Table className="border border-border rounded-lg text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[min(40%,200px)] text-right text-muted-foreground">البيان</TableHead>
              <TableHead className="text-right text-muted-foreground">القيمة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-middle text-sm">الفئة</TableCell>
              <TableCell>
                <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
                  <SelectTrigger className="text-right"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">قهوة (محصول)</SelectItem>
                    <SelectItem value="equipment">معدات (V60، مطاحن، فلاتر، أكواب...)</SelectItem>
                    <SelectItem value="other">منتج آخر</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-middle text-sm">اسم المنتج *</TableCell>
              <TableCell><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className="text-right" /></TableCell>
            </TableRow>
            {category === "equipment" ? (
              <>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">الماركة *</TableCell>
                  <TableCell>
                    <Select value={brandSlug} onValueChange={setBrandSlug}>
                      <SelectTrigger className="text-right"><SelectValue placeholder="اختر ماركة" /></SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">نوع المعدّة</TableCell>
                  <TableCell>
                    <Select value={equipmentType || undefined} onValueChange={(v) => setEquipmentType(v as EquipmentType)}>
                      <SelectTrigger className="text-right"><SelectValue placeholder="اختر..." /></SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{equipmentTypeLabel(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell className="text-right text-muted-foreground align-middle text-sm">المحمصة *</TableCell>
                <TableCell>
                  <Select value={roasterSlug} onValueChange={setRoasterSlug}>
                    <SelectTrigger className="text-right"><SelectValue placeholder="اختر محمصة" /></SelectTrigger>
                    <SelectContent>
                      {roasters.map((r) => (
                        <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-middle text-sm">الوسم (اختياري)</TableCell>
              <TableCell><Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="جديد / محدود..." maxLength={30} className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-middle text-sm">سعر البيع (د.ك) *</TableCell>
              <TableCell><Input type="number" step="0.001" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="text-right" dir="ltr" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-middle text-sm">سعر التكلفة (د.ك)</TableCell>
              <TableCell><Input type="number" step="0.001" min="0" value={cost} onChange={(e) => setCost(e.target.value)} className="text-right" dir="ltr" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-middle text-sm">الوزن</TableCell>
              <TableCell><Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="250g / 1kg" maxLength={20} className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-middle text-sm">الكمية المتوفرة</TableCell>
              <TableCell><Input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} className="text-right" dir="ltr" /></TableCell>
            </TableRow>
            {category === "coffee" && (
              <>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">نوع القهوة</TableCell>
                  <TableCell>
                    <Select value={coffeeType || undefined} onValueChange={(v) => setCoffeeType(v as CoffeeType)}>
                      <SelectTrigger className="text-right"><SelectValue placeholder="اختر..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filter">فلتر</SelectItem>
                        <SelectItem value="espresso">اسبريسو</SelectItem>
                        <SelectItem value="omni">أومني</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">المصدر / المنشأ</TableCell>
                  <TableCell><Input value={origin} onChange={(e) => setOrigin(e.target.value)} maxLength={60} className="text-right" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">الارتفاع</TableCell>
                  <TableCell><Input value={altitude} onChange={(e) => setAltitude(e.target.value)} placeholder="1800-2000m" maxLength={40} className="text-right" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">السلالة</TableCell>
                  <TableCell><Input value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="Heirloom / Caturra..." maxLength={80} className="text-right" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">المعالجة</TableCell>
                  <TableCell><Input value={process} onChange={(e) => setProcess(e.target.value)} placeholder="Washed / Natural..." maxLength={80} className="text-right" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right text-muted-foreground align-middle text-sm">الإيحاءات</TableCell>
                  <TableCell><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ياسمين، شوكولاتة، توت..." maxLength={200} className="text-right" /></TableCell>
                </TableRow>
              </>
            )}
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">تفاصيل إضافية</TableCell>
              <TableCell><Textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={600} rows={3} className="text-right" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-right text-muted-foreground align-top text-sm">صورة المنتج *</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-3">
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (f) setImg(await fileToDataURL(f));
                  }} className="min-w-0" />
                  {img ? (
                    <img src={img} alt="preview" className="h-16 w-16 rounded object-cover border border-border shrink-0" />
                  ) : (
                    <div className="h-16 w-16 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <DialogFooter>
          <Button onClick={submit} className="bg-primary hover:bg-accent">حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Main page ----------------
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_PASS_KEY) === "1");
  const { roasters, products, brands } = useCatalog();
  const [filterRoaster, setFilterRoaster] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authed) return;
    const load = () => {
      if (isSupabaseEnabled()) {
        void fetchAllOrdersForAdmin().then(setOrders);
      } else {
        setOrders(getOrders());
      }
    };
    load();
    const onStorage = () => load();
    const onOrders = () => load();
    window.addEventListener("storage", onStorage);
    window.addEventListener("orders:changed", onOrders);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("orders:changed", onOrders);
    };
  }, [authed]);

  const filtered = useMemo(
    () => (filterRoaster === "all" ? products : products.filter((p) => p.roasterSlug === filterRoaster)),
    [products, filterRoaster],
  );

  const soldOut = useMemo(() => products.filter((p) => p.qty === 0), [products]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 container mx-auto px-4 md:px-6 py-10">
            {!authed ? (
              <AdminLogin onOk={() => setAuthed(true)} />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                  <div>
                    <span className="text-xs tracking-[0.3em] text-accent uppercase">Admin</span>
                    <h1 className="font-display text-3xl md:text-4xl text-primary mt-2">لوحة التحكم</h1>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => { sessionStorage.removeItem(ADMIN_PASS_KEY); setAuthed(false); }}
                  >
                    <LogOut className="h-4 w-4 ml-2" /> خروج
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                  <StatCard icon={<Store className="h-4 w-4" />} label="المحامص" value={roasters.length} />
                  <StatCard icon={<Wrench className="h-4 w-4" />} label="ماركات المعدات" value={brands.length} />
                  <StatCard icon={<Coffee className="h-4 w-4" />} label="المنتجات" value={products.length} />
                  <StatCard
                    label="محاصيل"
                    value={products.filter((p) => p.category === "coffee").length}
                  />
                  <StatCard
                    label="معدات"
                    value={products.filter((p) => p.category === "equipment").length}
                  />
                </div>

                <Tabs defaultValue="products">
                  <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="products">المنتجات</TabsTrigger>
                    <TabsTrigger value="roasters">المحامص</TabsTrigger>
                    <TabsTrigger value="brands"><Wrench className="h-3.5 w-3.5 ml-1.5" />ماركات المعدات</TabsTrigger>
                    <TabsTrigger value="reports"><BarChart3 className="h-3.5 w-3.5 ml-1.5" />تقارير البيع</TabsTrigger>
                    <TabsTrigger value="soldout">
                      <PackageX className="h-3.5 w-3.5 ml-1.5" />نفذت الكمية
                      {soldOut.length > 0 && (
                        <Badge className="mr-2 h-4 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                          {soldOut.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* ---------- Roasters ---------- */}
                  <TabsContent value="roasters" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-xl text-primary">قائمة المحامص</h2>
                      <RoasterDialog
                        trigger={<Button className="bg-primary hover:bg-accent"><Plus className="h-4 w-4 ml-2" /> محمصة جديدة</Button>}
                      />
                    </div>

                    {roasters.length === 0 ? (
                      <EmptyState text="لا توجد محامص بعد. أضف أول محمصة لتظهر في الموقع." />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roasters.map((r) => (
                          <div key={r.slug} className="bg-card border border-border rounded-xl p-4 flex gap-3">
                            <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {r.logo
                                ? <img src={r.logo} alt={r.name} className="h-full w-full object-cover" />
                                : <span className="font-display text-primary">{r.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-primary truncate">{r.name}</h3>
                              <p className="text-xs text-muted-foreground">{r.origin}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.description}</p>
                              <div className="flex gap-2 mt-3">
                                <RoasterDialog
                                  initial={r}
                                  trigger={<Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5 ml-1" /> تعديل</Button>}
                                />
                                <Button
                                  size="sm" variant="outline"
                                  onClick={() => {
                                    if (confirm(`حذف المحمصة "${r.name}" وكل منتجاتها؟`)) {
                                      deleteRoaster(r.slug); toast.success("تم الحذف");
                                    }
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 ml-1" /> حذف
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* ---------- Products ---------- */}
                  <TabsContent value="products" className="mt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <h2 className="font-display text-xl text-primary">قائمة المنتجات</h2>
                      <div className="flex items-center gap-2">
                        <Select value={filterRoaster} onValueChange={setFilterRoaster}>
                          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">كل المحامص</SelectItem>
                            {roasters.map((r) => (
                              <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ProductDialog
                          roasters={roasters}
                          brands={brands}
                          trigger={
                            <Button className="bg-primary hover:bg-accent" disabled={roasters.length === 0 && brands.length === 0}>
                              <Plus className="h-4 w-4 ml-2" /> منتج جديد
                            </Button>
                          }
                        />
                      </div>
                    </div>

                    {roasters.length === 0 && brands.length === 0 ? (
                      <EmptyState text="أضف محمصة أو ماركة معدات أولاً قبل إضافة المنتجات." />
                    ) : filtered.length === 0 ? (
                      <EmptyState text="لا توجد منتجات بعد." />
                    ) : (
                      <div className="overflow-x-auto bg-card border border-border rounded-xl">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 text-muted-foreground">
                            <tr className="text-right">
                              <th className="p-3">المنتج</th>
                              <th className="p-3">المحمصة / الماركة</th>
                              <th className="p-3">الفئة</th>
                              <th className="p-3">السعر</th>
                              <th className="p-3">التكلفة</th>
                              <th className="p-3">الوزن</th>
                              <th className="p-3">المخزون</th>
                              <th className="p-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((p) => (
                              <tr key={p.id} className="border-t border-border">
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <img src={p.img} alt={p.name} className="h-10 w-10 rounded object-cover bg-muted" />
                                    <div>
                                      <div className="text-primary font-medium">{p.name}</div>
                                      {p.tag && <Badge variant="secondary" className="text-[10px] mt-0.5">{p.tag}</Badge>}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-muted-foreground">{p.category === "equipment" ? (p.brand ?? "—") : (p.roaster || "—")}</td>
                                <td className="p-3 text-muted-foreground">
                                  {p.category === "coffee"
                                    ? `قهوة${p.coffeeType ? ` · ${labelType(p.coffeeType)}` : ""}`
                                    : p.category === "equipment"
                                    ? `معدات${p.equipmentType ? ` · ${equipmentTypeLabel(p.equipmentType)}` : ""}`
                                    : "أخرى"}
                                </td>
                                <td className="p-3 text-primary">{p.price.toFixed(3)}</td>
                                <td className="p-3 text-muted-foreground">{p.cost?.toFixed(3) ?? "—"}</td>
                                <td className="p-3 text-muted-foreground">{p.weight ?? "—"}</td>
                                <td className="p-3 text-muted-foreground">{p.qty ?? "—"}</td>
                                <td className="p-3">
                                  <div className="flex justify-end gap-2">
                                    <ProductDialog
                                      roasters={roasters}
                                      brands={brands}
                                      initial={p}
                                      trigger={<Button size="icon" variant="outline" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>}
                                    />
                                    <Button
                                      size="icon" variant="outline"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => {
                                        if (confirm(`حذف المنتج "${p.name}"؟`)) {
                                          deleteProduct(p.id); toast.success("تم الحذف");
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-4">
                      ملاحظة: للمنتجات غير المكتملة (بدون صورة أو سعر) لن تظهر للزوار في الموقع.
                    </p>
                    <div className="mt-4">
                      <Link to="/" className="text-sm text-accent hover:underline">عرض الموقع كزائر ←</Link>
                    </div>
                  </TabsContent>

                  {/* ---------- Equipment Brands ---------- */}
                  <TabsContent value="brands" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-xl text-primary">ماركات المعدات</h2>
                      <BrandDialog
                        trigger={<Button className="bg-primary hover:bg-accent"><Plus className="h-4 w-4 ml-2" /> ماركة جديدة</Button>}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground mb-4">
                      أضف ماركات المعدات (Hario، Comandante...) ثم صنّف منتجاتها ضمن الأنواع: V60، المطاحن، الفلاتر، الأكواب، أو غيرها.
                    </p>

                    {brands.length === 0 ? (
                      <EmptyState text="لا توجد ماركات بعد. أضف أول ماركة لتتمكن من تصنيف المعدات." />
                    ) : (
                      <div className="overflow-x-auto bg-card border border-border rounded-xl">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 text-muted-foreground">
                            <tr className="text-right">
                              <th className="p-3">الماركة</th>
                              <th className="p-3">الوصف</th>
                              <th className="p-3">عدد المنتجات</th>
                              <th className="p-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {brands.map((b) => {
                              const count = products.filter((p) => p.brandSlug === b.slug).length;
                              return (
                                <tr key={b.slug} className="border-t border-border">
                                  <td className="p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                        {b.logo
                                          ? <img src={b.logo} alt={b.name} className="h-full w-full object-cover" />
                                          : <Wrench className="h-4 w-4 text-muted-foreground" />}
                                      </div>
                                      <div className="text-primary font-medium">{b.name}</div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-muted-foreground line-clamp-2 max-w-md">{b.description ?? "—"}</td>
                                  <td className="p-3 text-muted-foreground">{count}</td>
                                  <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                      <BrandDialog
                                        initial={b}
                                        trigger={<Button size="icon" variant="outline" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>}
                                      />
                                      <Button
                                        size="icon" variant="outline"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => {
                                          if (confirm(`حذف الماركة "${b.name}"؟ سيتم فصلها عن منتجاتها.`)) {
                                            deleteBrand(b.slug); toast.success("تم الحذف");
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>

                  {/* ---------- Reports ---------- */}
                  <TabsContent value="reports" className="mt-6">
                    <ReportsPanel orders={orders} products={products} />
                  </TabsContent>

                  {/* ---------- Sold out ---------- */}
                  <TabsContent value="soldout" className="mt-6">
                    <SoldOutPanel items={soldOut} />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="font-display text-2xl text-primary mt-1">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-border rounded-xl py-16 text-center text-muted-foreground">
      {text}
    </div>
  );
}

function labelType(t: CoffeeType) {
  return t === "filter" ? "فلتر" : t === "espresso" ? "اسبريسو" : "أومني";
}

// ---------------- Reports Panel ----------------
function ReportsPanel({ orders, products }: { orders: Order[]; products: Product[] }) {
  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const revenue = valid.reduce((s, o) => s + o.total, 0);
    const subtotalSum = valid.reduce((s, o) => s + o.subtotal, 0);
    const ordersCount = valid.length;
    const itemsSold = valid.reduce(
      (s, o) => s + o.items.reduce((x, i) => x + i.qty, 0),
      0,
    );
    const avg = ordersCount ? revenue / ordersCount : 0;

    // cost & profit (uses product.cost when available)
    const costMap = new Map(products.map((p) => [p.id, p.cost ?? 0]));
    const cost = valid.reduce(
      (s, o) =>
        s +
        o.items.reduce((x, i) => x + (costMap.get(i.id) ?? 0) * i.qty, 0),
      0,
    );
    const profit = subtotalSum - cost;

    // by product
    const byProduct = new Map<string, { name: string; roaster: string; qty: number; revenue: number }>();
    valid.forEach((o) =>
      o.items.forEach((it) => {
        const cur = byProduct.get(it.id) ?? { name: it.name, roaster: it.roaster, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.price * it.qty;
        byProduct.set(it.id, cur);
      }),
    );
    const topProducts = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // by roaster
    const byRoaster = new Map<string, { name: string; qty: number; revenue: number }>();
    valid.forEach((o) =>
      o.items.forEach((it) => {
        const cur = byRoaster.get(it.roaster) ?? { name: it.roaster, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.price * it.qty;
        byRoaster.set(it.roaster, cur);
      }),
    );
    const topRoasters = [...byRoaster.values()].sort((a, b) => b.revenue - a.revenue);

    // by status
    const byStatus: Record<string, number> = {};
    orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] ?? 0) + 1; });

    return { revenue, ordersCount, itemsSold, avg, cost, profit, topProducts, topRoasters, byStatus };
  }, [orders, products]);

  if (orders.length === 0) {
    return <EmptyState text="لا توجد طلبات بعد لإنشاء التقارير." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<ShoppingCart className="h-4 w-4" />} label="إجمالي الطلبات" value={stats.ordersCount} />
        <StatCardCurrency icon={<TrendingUp className="h-4 w-4" />} label="إجمالي المبيعات" value={stats.revenue} />
        <StatCardCurrency label="صافي الربح" value={stats.profit} hint="(يحسب فقط للمنتجات التي عرّفت تكلفتها)" />
        <StatCardCurrency label="متوسط الطلب" value={stats.avg} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display text-primary mb-4">المنتجات الأعلى مبيعًا</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.topProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.roaster} · {p.qty} قطعة</p>
                  </div>
                  <span className="font-display text-primary whitespace-nowrap">{p.revenue.toFixed(3)} د.ك</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display text-primary mb-4">المبيعات حسب المحمصة</h3>
          {stats.topRoasters.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.topRoasters.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.qty} قطعة</p>
                  </div>
                  <span className="font-display text-primary">{r.revenue.toFixed(3)} د.ك</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display text-primary mb-4">آخر الطلبات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-right">
                <th className="p-2.5">رقم</th>
                <th className="p-2.5">التاريخ</th>
                <th className="p-2.5">القطع</th>
                <th className="p-2.5">الدفع</th>
                <th className="p-2.5">الحالة</th>
                <th className="p-2.5">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-2.5 font-mono text-xs text-primary">{o.id}</td>
                  <td className="p-2.5 text-muted-foreground">{new Date(o.date).toLocaleDateString("ar-KW")}</td>
                  <td className="p-2.5 text-muted-foreground">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                  <td className="p-2.5 text-muted-foreground">{o.payment === "cash" ? "كاش" : "كي نت"}</td>
                  <td className="p-2.5"><Badge variant="secondary" className="text-[10px]">{o.status}</Badge></td>
                  <td className="p-2.5 text-primary">{o.total.toFixed(3)} د.ك</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCardCurrency({ icon, label, value, hint }: { icon?: React.ReactNode; label: string; value: number; hint?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="font-display text-2xl text-primary mt-1">
        {value.toFixed(3)} <span className="text-sm text-muted-foreground">د.ك</span>
      </div>
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

// ---------------- Sold Out Panel ----------------
function SoldOutPanel({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return <EmptyState text="لا توجد منتجات نفذت كميتها حاليًا. ✓" />;
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        المنتجات التي وصل مخزونها إلى صفر. يمكنك إخفاؤها مؤقتًا من الموقع أو إعادة تعبئة المخزون.
      </p>
      <div className="overflow-x-auto bg-card border border-border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-right">
              <th className="p-3">المنتج</th>
              <th className="p-3">المحمصة</th>
              <th className="p-3">السعر</th>
              <th className="p-3">الحالة في الموقع</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt={p.name} className="h-10 w-10 rounded object-cover bg-muted" />
                    <div>
                      <div className="text-primary font-medium">{p.name}</div>
                      <Badge className="text-[10px] mt-0.5 bg-destructive/15 text-destructive border-0">نفذت الكمية</Badge>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.roaster}</td>
                <td className="p-3 text-primary">{p.price.toFixed(3)}</td>
                <td className="p-3">
                  {p.hidden ? (
                    <Badge variant="secondary" className="text-[10px]"><EyeOff className="h-3 w-3 ml-1" /> مخفي</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0"><Eye className="h-3 w-3 ml-1" /> ظاهر</Badge>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        upsertProduct({ ...p, hidden: !p.hidden });
                        toast.success(p.hidden ? "تم إظهار المنتج" : "تم إخفاء المنتج من الموقع");
                      }}
                    >
                      {p.hidden ? (<><Eye className="h-3.5 w-3.5 ml-1" /> إظهار</>) : (<><EyeOff className="h-3.5 w-3.5 ml-1" /> إخفاء من الموقع</>)}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
