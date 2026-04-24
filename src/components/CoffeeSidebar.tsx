import { Coffee, Wrench, Package, Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

const nav = [
  {
    title: "محاصيل القهوة",
    icon: Coffee,
    items: [
      { label: "كل المحامص", to: "/roasters" },
      { label: "فلتر", to: "/#products?type=filter" },
      { label: "اسبريسو", to: "/#products?type=espresso" },
      { label: "وزن 1 كيلو", to: "/#products?weight=1kg" },
    ],
  },
  {
    title: "أدوات التحضير",
    icon: Wrench,
    items: [
      { label: "V60", to: "/equipment/v60" },
      { label: "المطاحن", to: "/equipment/grinders" },
      { label: "الفلاتر", to: "/equipment/filters" },
      { label: "الأكواب", to: "/equipment/cups" },
    ],
  },
  {
    title: "الخدمات",
    icon: Sparkles,
    items: [
      { label: "طلب أسعار الجملة", to: "/services/wholesale" },
      { label: "خدمة كاترنغ القهوة", to: "/services/catering" },
    ],
  },
  {
    title: "حسابي",
    icon: Package,
    items: [
      { label: "الملف الشخصي", to: "/profile" },
      { label: "السلة", to: "/cart" },
      { label: "تسجيل الدخول", to: "/login" },
    ],
  },
];

export function CoffeeSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [open, setOpen] = useState<string | null>("محاصيل القهوة");

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="px-4 pt-6 pb-4 border-b border-sidebar-border">
          <h2 className="font-display text-xl text-sidebar-primary">
            {collapsed ? "RL" : "Roast Lab"}
          </h2>
          {!collapsed && <p className="text-xs text-sidebar-foreground/60 mt-1">قهوة مختصة • الكويت</p>}
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">التصفح</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((section) => {
                const isOpen = open === section.title;
                return (
                  <SidebarMenuItem key={section.title}>
                    <SidebarMenuButton
                      onClick={() => setOpen(isOpen ? null : section.title)}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <section.icon className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-right">{section.title}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </SidebarMenuButton>
                    {!collapsed && isOpen && (
                      <SidebarMenuSub>
                        {section.items.map((item) => (
                          <SidebarMenuSubItem key={item.label}>
                            <SidebarMenuSubButton asChild className="text-sidebar-foreground/80 hover:text-sidebar-primary cursor-pointer">
                              <Link to={item.to}>{item.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
