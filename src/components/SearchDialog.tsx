import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCatalog } from "@/data/catalog";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { products } = useCatalog();
  const [q, setQ] = useState("");

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products
      .filter((p) =>
        [p.name, p.roaster, p.brand, p.origin, p.notes, p.equipmentType]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(t))
      )
      .slice(0, 12);
  }, [q, products]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">بحث المنتجات</DialogTitle>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن قهوة، محمصة، معدات..."
            className="border-0 focus-visible:ring-0 px-0 text-base"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() === "" ? (
            <p className="p-8 text-center text-sm text-muted-foreground">ابدأ الكتابة للبحث في المتجر...</p>
          ) : results.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">لا توجد نتائج لـ "{q}"</p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/product/${p.id}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <img src={p.img} alt={p.name} className="h-12 w-12 rounded-md object-cover bg-muted" />
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-display text-sm text-primary truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.roaster || p.brand}</p>
                    </div>
                    <span className="text-xs font-display text-accent shrink-0">{p.price.toFixed(3)} د.ك</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
