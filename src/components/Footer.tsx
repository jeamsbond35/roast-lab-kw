import { Instagram, Twitter, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-espresso text-primary-foreground/80">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-2xl text-primary-foreground">Roast Lab <span className="text-accent">KW</span></h3>
            <p className="mt-3 text-sm leading-relaxed">قهوة مختصة محمّصة بحب، توصل لين بابك في الكويت.</p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="h-9 w-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-display text-primary-foreground mb-4">المتجر</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#products" className="hover:text-accent">محاصيل القهوة</Link></li>
              <li><Link to="/equipment/v60" className="hover:text-accent">أدوات التحضير</Link></li>
              <li><Link to="/equipment/cups" className="hover:text-accent">الأكواب</Link></li>
              <li><Link to="/roasters" className="hover:text-accent">المحامص</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-primary-foreground mb-4">الخدمات</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services/wholesale" className="hover:text-accent">طلب أسعار الجملة</Link></li>
              <li><Link to="/services/catering" className="hover:text-accent">كاترنغ القهوة</Link></li>
              <li><Link to="/login" className="hover:text-accent">تسجيل الدخول</Link></li>
              <li><Link to="/profile" className="hover:text-accent">حسابي</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-primary-foreground mb-4">الدعم</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-accent">الشحن والتوصيل</a></li>
              <li><a href="#" className="hover:text-accent">الإرجاع</a></li>
              <li><a href="#" className="hover:text-accent">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-accent">الخصوصية</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between gap-3 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Roast Lab KW. جميع الحقوق محفوظة.</p>
          <p>صُنع بحب في الكويت ☕</p>
        </div>
      </div>
    </footer>
  );
}
