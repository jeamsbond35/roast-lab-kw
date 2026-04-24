import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { mergeCatalogFromSupabase } from "@/lib/supabase/catalogSync";
import { isSupabaseEnabled } from "@/lib/supabaseClient";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import RoasterPage from "./pages/RoasterPage.tsx";
import Roasters from "./pages/Roasters.tsx";
import Profile from "./pages/Profile.tsx";
import Admin from "./pages/Admin.tsx";
import Login from "./pages/Login.tsx";
import EquipmentCategory from "./pages/EquipmentCategory.tsx";
import Wholesale from "./pages/Wholesale.tsx";
import Catering from "./pages/Catering.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function SupabaseCatalogInit() {
  useEffect(() => {
    if (!isSupabaseEnabled()) return;
    void mergeCatalogFromSupabase();
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseCatalogInit />
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/roasters" element={<Roasters />} />
            <Route path="/roaster/:slug" element={<RoasterPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/equipment/:type" element={<EquipmentCategory />} />
            <Route path="/services/wholesale" element={<Wholesale />} />
            <Route path="/services/catering" element={<Catering />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
