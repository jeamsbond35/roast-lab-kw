import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import heroImg from "@/assets/hero-coffee.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1..1
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setTilt({ x, y });
  };

  const onLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden group cursor-pointer"
    >
      {/* خلفية مع تأثير parallax + Ken Burns */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="قهوة مختصة"
          width={1600}
          height={1200}
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-out will-change-transform animate-[kenburns_18s_ease-in-out_infinite_alternate]"
          style={{
            transform: `scale(1.08) translate(${tilt.x * -14}px, ${tilt.y * -10}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        {/* بخار متحرك */}
        <div
          className="absolute top-1/4 right-1/3 w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-pulse"
          style={{ transform: `translate(${tilt.x * 30}px, ${tilt.y * 20}px)` }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-primary/20 blur-3xl"
          style={{
            transform: `translate(${tilt.x * -25}px, ${tilt.y * -15}px)`,
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative container mx-auto px-6 py-12 md:py-16">
        <div
          className={`max-w-2xl text-right transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transform: `translate(${tilt.x * 6}px, ${tilt.y * 4}px)` }}
        >
          <span className="inline-block text-[10px] tracking-[0.3em] text-accent font-medium uppercase mb-3 animate-fade-in">
            ☕ أهلاً بك · Specialty Coffee · Kuwait
          </span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-primary-foreground leading-[1.15] text-balance">
            قهوة توصل <span className="text-accent inline-block hover:scale-110 transition-transform">لين بابك</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-primary-foreground/80 leading-relaxed max-w-xl">
            مختارات مختصة من أفضل المحامص، محمّصة طازجة وموصّلة إليك خلال أيام.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm shadow-elegant hover:scale-105 transition-transform"
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
            >
              تسوّق الآن
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground rounded-full px-5 h-9 text-sm"
              onClick={() => document.getElementById("roasters")?.scrollIntoView({ behavior: "smooth" })}
            >
              اكتشف المحامص
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1.08) translate(0, 0); }
          100% { transform: scale(1.15) translate(-2%, -1%); }
        }
      `}</style>
    </section>
  );
}
