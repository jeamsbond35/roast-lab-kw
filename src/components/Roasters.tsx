import { Link } from "react-router-dom";
import { useCatalog } from "@/data/catalog";

export function Roasters() {
  const { roasters } = useCatalog();
  if (roasters.length === 0) return null;
  return (
    <section id="roasters" className="py-20 md:py-28 bg-muted/40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs tracking-[0.3em] text-accent uppercase">Featured Roasters</span>
          <h2 className="font-display text-4xl md:text-5xl text-primary mt-3">محامص مختارة بعناية</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {roasters.map((r) => (
            <Link
              key={r.slug}
              to={`/roaster/${r.slug}`}
              className="group bg-card border border-border rounded-xl p-6 text-center hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-20 w-20 mx-auto mb-3 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden group-hover:bg-accent transition-colors">
                {r.logo ? (
                  // show roaster logo if provided
                  <img src={r.logo} alt={r.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full w-full font-display text-primary text-xl">
                    {r.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="font-display text-sm text-primary">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.origin}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
