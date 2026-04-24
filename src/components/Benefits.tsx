import { Truck, ShieldCheck, Coffee, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { icon: Truck, title: "توصيل سريع", desc: "خلال 24 ساعة داخل الكويت", to: "/#products" },
  { icon: ShieldCheck, title: "دفع آمن", desc: "كافة البطاقات مدعومة بحماية كاملة", to: "/checkout" },
  { icon: Coffee, title: "منتجات مختارة", desc: "حبوب من أفضل المحامص حول العالم", to: "/roasters" },
  { icon: Headphones, title: "خدمات الشركات", desc: "أسعار جملة وكاترنغ للفعاليات", to: "/services/wholesale" },
];

export function Benefits() {
  return (
    <section className="py-20 md:py-24 bg-gradient-warm">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <Link
              key={it.title}
              to={it.to}
              className="bg-card border border-border rounded-2xl p-7 hover:shadow-card hover:-translate-y-1 transition-all duration-300 text-right block"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5">
                <it.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display text-lg text-primary">{it.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{it.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
