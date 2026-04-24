import { SidebarProvider } from "@/components/ui/sidebar";
import { CoffeeSidebar } from "@/components/CoffeeSidebar";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Roasters } from "@/components/Roasters";
import { ProductGrid } from "@/components/ProductGrid";
import { LatestByCategory } from "@/components/LatestByCategory";
import { BestSellingCoffee } from "@/components/BestSellingCoffee";
import { Subscription } from "@/components/Subscription";
import { Benefits } from "@/components/Benefits";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <CoffeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1">
            <Hero />
            <Roasters />
            <BestSellingCoffee />
            <LatestByCategory />
            <ProductGrid />
            <Subscription />
            <Benefits />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
