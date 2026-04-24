import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import subImg from "@/assets/subscription.jpg";

const benefits = [
  "حبوب طازجة من محامص متغيرة كل شهر",
  "توصيل مجاني داخل الكويت",
  "إمكانية الإيقاف أو التغيير في أي وقت",
  "بطاقة تذوق مع كل صندوق",
];

export function Subscription() {
  return (
    <section id="subscription" className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <img
              src={subImg}
              alt="صندوق اشتراك القهوة"
              width={1400}
              height={1000}
              loading="lazy"
              className="rounded-2xl shadow-elegant w-full aspect-[4/3] object-cover"
            />
            <div className="absolute -bottom-5 -right-5 bg-accent text-accent-foreground rounded-2xl p-5 shadow-elegant hidden md:block">
              <p className="font-display text-3xl">12 د.ك</p>
              <p className="text-xs opacity-80">/ شهريًا</p>
            </div>
          </div>

          <div className="order-1 lg:order-2 text-right">
            <span className="text-xs tracking-[0.3em] text-accent uppercase">Monthly Subscription</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
              اشترك واستمتع<br />
              <span className="text-accent">بقهوة جديدة كل شهر</span>
            </h2>
            <p className="mt-5 text-primary-foreground/75 text-lg leading-relaxed">
              صندوق شهري يحوي مختارات حصرية من أفضل المحامص، يوصل مباشرة إلى بابك.
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-primary-foreground/90">
                  <span className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="h-3 w-3 text-accent-foreground" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-10 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-12">
              ابدأ اشتراكك
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
