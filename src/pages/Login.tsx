import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { Phone, LogIn } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginWithPhone } from "@/lib/customerAuth";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\s-]{8,15}$/, "رقم الهاتف غير صحيح");

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = phoneSchema.safeParse(phone);
    if (!r.success) {
      setError(r.error.issues[0].message);
      return;
    }
    loginWithPhone(r.data);
    toast.success("تم تسجيل الدخول");
    navigate("/profile");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-card">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl text-primary text-center mt-4">
                تسجيل الدخول
              </h1>
              <p className="text-sm text-muted-foreground text-center mt-1">
                أدخل رقم هاتفك للوصول إلى حسابك وطلباتك
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    رقم الهاتف
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(undefined);
                    }}
                    placeholder="965XXXXXXXX"
                    inputMode="tel"
                    dir="ltr"
                    className="text-right"
                    maxLength={15}
                    autoFocus
                  />
                  {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-accent">
                  <LogIn className="h-4 w-4 ml-2" /> دخول
                </Button>
              </form>
              <p className="text-[11px] text-muted-foreground text-center mt-5">
                لا تحتاج كلمة مرور — رقم هاتفك هو معرّفك. للحماية الكاملة وOTP فعّل Lovable Cloud.
              </p>
              <div className="text-center mt-3">
                <Link to="/" className="text-xs text-accent hover:underline">
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
