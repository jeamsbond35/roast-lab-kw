import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      setProduct(data);
    };

    load();
  }, [id]);

  if (!product) {
    return (
      <div className="p-10 text-center">
        المنتج غير موجود
        <br />
        <Link to="/">العودة</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <img src={product.img} className="w-full max-w-md" />

      <h1 className="text-2xl mt-4">{product.name}</h1>

      <p className="text-muted-foreground mt-2">
        {product.details}
      </p>

      <div className="mt-4 text-xl">
        {product.price} د.ك
      </div>

      <div className="flex items-center gap-4 mt-6">
        <Button onClick={() => setQty((q) => Math.max(1, q - 1))}>
          <Minus />
        </Button>

        <span>{qty}</span>

        <Button onClick={() => setQty((q) => q + 1)}>
          <Plus />
        </Button>
      </div>

      <Button
        className="mt-6 w-full"
        onClick={() => {
          add(product, qty);
          toast.success("تمت الإضافة للسلة");
        }}
      >
        <ShoppingBag className="ml-2" />
        أضف للسلة
      </Button>
    </div>
  );
}
