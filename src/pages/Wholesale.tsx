import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Truck, Percent, Headphones } from "lucide-react";

const STORE_KEY = "rl_wholesale_requests_v1";

export default function Wholesale() {
  const [form, setForm] = useState({ company: "", name: "", phone: "", email: "", quantity: "", notes: "" });
  useEffect(() => { document.title = "طلب أسعار الجملة | Roast Lab KW"; }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.name || !form.phone) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }
    const list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    list.push({ ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    toast.success("تم إرسال طلبك", { description: "سنتواصل معك خلال 24 ساعة" });
    setForm({ company: "", name: "", phone: "", email: "", quantity: "", notes: "" });
  };

  const features = [
    { icon: Percent, title: "أسعار تنافسية", desc: "خصومات حسب الكميات" },
    { icon: Truck, title: "توصيل مجاني", desc: "للطلبات الكبيرة داخل الكويت" },
    { icon: Building2, title: "حلول للمنشآت", desc: "مكاتب، فنادق، مطاعم، مقاهي" },
    { icon: Headphones, title: "دعم مخصص", desc: "مدير حساب لكل عميل جملة" },
  ];

  return (
    <SidebarProvider defaultOpen={false}>
      <CoffeeSidebar />
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[0.3em] text-accent uppercase">Wholesale</span>
            <h1 className="font-display text-4xl md:text-5xl text-primary mt-3">طلب أسعار الجملة</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              نوفّر حلول قهوة احترافية للمقاهي، المطاعم، الفنادق والشركات بأسعار جملة مميزة.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-5 text-center">
                <f.icon className="h-7 w-7 text-accent mx-auto mb-3" />
                <h3 className="font-display text-primary">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="font-display text-2xl text-primary mb-2">طلب عرض سعر</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>اسم المنشأة *</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <Label>الاسم *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>الهاتف *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>الكمية الشهرية المتوقعة (كجم)</Label>
                <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>تفاصيل إضافية</Label>
                <Textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-accent">إرسال الطلب</Button>
          </form>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
