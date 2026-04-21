"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProductForm from "../../_components/product-form";

export default function EditProductContent() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load product details");
        }

        setProduct(data.product);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      void fetchProduct();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-[2rem] border border-[#e5e0cc] bg-[#faf7ee] p-8 text-center text-[#6d7452]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-rice-green)]" />
        <p className="font-semibold text-[#364127]">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-[2rem] border border-[#e9cabb] bg-[#fff4ef] p-8 text-center text-[#a14c34]">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="font-semibold">{error || "Product not found"}</p>
      </div>
    );
  }

  return <ProductForm initialData={product} />;
}
