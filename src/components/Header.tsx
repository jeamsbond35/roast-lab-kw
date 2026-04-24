import { ShoppingBag, User, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { SearchDialog } from "@/components/SearchDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCatalog } from "@/data/catalog";

export function Header() {
  const { roasters } = useCatalog();
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 md:px-8">
        <SidebarTrigger className="text-foreground" />
        <Link to="/" className="font-display text-xl md:text-2xl text-primary tracking-tight">
          Roast Lab <span className="text-accent">KW</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 mr-6 text-sm text-muted-foreground">
          <Link to="/#products" className="hover:text-primary transition-colors">المنتجات</Link>
          {/* أدوات التحضير */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 hover:text-primary transition-colors outline-none">
              أدوات التحضير <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card">
              <DropdownMenuItem asChild>
                <Link to="/equipment/v60" className="cursor-pointer">V60</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/equipment/grinders" className="cursor-pointer">المطاحن</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/equipment/filters" className="cursor-pointer">الفلاتر</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/equipment/cups" className="cursor-pointer">الأكواب</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* الخدمات */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 hover:text-primary transition-colors outline-none">
              الخدمات <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card">
              <DropdownMenuItem asChild>
                <Link to="/services/wholesale" className="cursor-pointer">طلب أسعار الجملة</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/catering" className="cursor-pointer">خدمة كاترنغ القهوة</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* محاصيل القهوة */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 hover:text-primary transition-colors outline-none">
              محاصيل القهوة <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 bg-card">
              {/* 1. المحامص */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex-row-reverse justify-between">المحامص</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-56 bg-card">
                    {roasters.map((r) => (
                      <DropdownMenuItem key={r.slug} asChild>
                        <Link to={`/roaster/${r.slug}`} className="flex flex-col items-start cursor-pointer">
                          <span className="font-display text-primary">{r.name}</span>
                          <span className="text-xs text-muted-foreground">{r.origin}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/roasters" className="text-accent cursor-pointer">عرض كل المحامص ←</Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* 2. النوع */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex-row-reverse justify-between">النوع</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44 bg-card">
                    <DropdownMenuItem asChild>
                      <Link to="/#products?type=filter" className="cursor-pointer">فلتر</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/#products?type=espresso" className="cursor-pointer">اسبريسو</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/#products" className="text-accent cursor-pointer">الكل</Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* 3. وزن 1 كيلو */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex-row-reverse justify-between">وزن 1 كيلو</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44 bg-card">
                    <DropdownMenuItem asChild>
                      <Link to="/#products?weight=1kg" className="cursor-pointer">عرض منتجات 1 كيلو</Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* 4. المصدر */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex-row-reverse justify-between">المصدر</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-48 bg-card">
                    <DropdownMenuItem asChild>
                      <Link to="/#products?origin=ethiopia" className="cursor-pointer">إثيوبيا</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/#products?origin=colombia" className="cursor-pointer">كولومبيا</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/#products?origin=kenya" className="cursor-pointer">كينيا</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/#products?origin=panama" className="cursor-pointer">بنما</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/#products" className="text-accent cursor-pointer">كل المصادر</Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <a href="#about" className="hover:text-primary transition-colors">من نحن</a>
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="بحث" onClick={() => setSearchOpen(true)}><Search className="h-5 w-5" /></Button>
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
          <Button variant="ghost" size="icon" aria-label="حسابي" asChild>
            <Link to="/profile"><User className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="السلة" asChild className="relative">
            <Link to="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -left-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-[10px] text-accent-foreground flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
