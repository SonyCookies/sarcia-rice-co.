"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, Search, PlusCircle, Trash2, CheckCircle2 } from "lucide-react";
import AdminShell from "@/app/admin/_components/admin-shell";

type Product = {
  id: number;
  name: string;
  weight: string;
  stock_quantity: number;
  image_url: string | null;
  stock_status: string;
};

type ManifestItem = Product & {
  added_quantity: string;
};

export default function BulkRestockContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [manifest, setManifest] = useState<ManifestItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/products?per_page=100")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const availableProducts = useMemo(() => {
    return products.filter(p => !manifest.some(m => m.id === p.id));
  }, [products, manifest]);

  const filteredProducts = useMemo(() => {
    const list = searchQuery
      ? availableProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : availableProducts;
    return [...list].sort((a, b) => a.stock_quantity - b.stock_quantity);
  }, [availableProducts, searchQuery]);

  const addToManifest = (product: Product) => {
    setManifest([...manifest, { ...product, added_quantity: "" }]);
    setSuccessMsg("");
  };

  const removeFromManifest = (id: number) => {
    setManifest(manifest.filter(item => item.id !== id));
  };

  const updateManifestQuantity = (id: number, val: string) => {
    if (val !== "" && !/^\d*$/.test(val)) return;
    setManifest(manifest.map(item => item.id === id ? { ...item, added_quantity: val } : item));
  };

  const canSubmit = manifest.length > 0 && manifest.every(m => parseInt(m.added_quantity) > 0);

  const submitManifest = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      const payload = manifest.map(item => ({
        id: item.id,
        added_quantity: parseInt(item.added_quantity)
      }));

      const response = await fetch("/api/admin/products/bulk-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload })
      });

      if (!response.ok) throw new Error("Failed to bulk restock.");

      const refetched = await fetch("/api/admin/products?per_page=100").then(r => r.json());
      setProducts(refetched.products || []);
      setManifest([]);
      setSuccessMsg("Delivery received and stock updated successfully!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert("An error occurred while saving the delivery.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skeleton Loader matching the product card design
  const ProductSkeleton = () => (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e5e0cc] bg-white p-3 animate-pulse">
      <div className="h-12 w-12 shrink-0 rounded-xl bg-[#dbd7c2]" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 rounded bg-[#dbd7c2]" />
        <div className="h-3 w-1/2 rounded bg-[#dbd7c2]" />
      </div>
      <div className="h-7 w-7 shrink-0 rounded-full bg-[#dbd7c2]" />
    </div>
  );

  return (
    <AdminShell
      subtitle="Select items to build your delivery manifest and add stock."
      searchPlaceholder="Search products by name"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-semibold text-[color:var(--color-rice-green)] transition hover:bg-[#f4efdf]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#2f3b1f_0%,#3d5a2b_52%,#4d6b35_100%)] px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,#f3e8c9_18%,transparent),transparent_22%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_10%,transparent),transparent_30%)] opacity-30" />
          <div className="relative flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f7efd5]">
              Inventory Management
            </p>
            <h1 className="font-poppins text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Review and update your product catalog.
            </h1>
            <p className="text-sm leading-7 text-[#f7efd5] max-w-2xl sm:text-base">
              Track available stock, update current prices, manage out-of-stock items, and add new rice variants.
            </p>
          </div>
        </div>
      </section>

      {successMsg && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#b8d49b] bg-[#f0f9e8] p-5 shadow-sm text-[#3d5a2b]">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <CheckCircle2 className="h-6 w-6 text-[#629143]" />
            {successMsg}
          </div>
          <Link href="/admin/products" className="shrink-0 text-sm font-bold underline hover:text-[#2f3b1f]">
            Return to Catalog
          </Link>
        </div>
      )}

      {/* Main Unified Container Layout matching products-page-content and users-page-content */}
      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6 mb-8">
        
        {/* Search Section */}
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] mb-6 border-b border-[#f0ede1] pb-6">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7b7a60]">
              Search Products
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-[#dbd7c2] bg-[#fffef9] px-4 py-3 shadow-[0_10px_24px_rgba(78,95,58,0.04)] transition-all focus-within:border-[color:var(--color-rice-green)] focus-within:bg-white">
              <Search className="h-4 w-4 text-[#8b8d70]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name to add to manifest..."
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
              />
            </div>
          </label>
        </div>

        {/* Builder Area */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* Left Side: Product Picker */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#7b7a60]">Available Inventory</h3>
            
            <div className="rounded-[1.4rem] border border-[#ddd9c6] bg-[#faf7ee]/50 p-4 shadow-inner h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToManifest(product)}
                      className="flex text-left items-center gap-3 rounded-2xl border border-[#e5e0cc] bg-white p-3 transition hover:border-[color:var(--color-rice-green)] hover:shadow-md group"
                    >
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-[#faf7ee] flex items-center justify-center border border-[#dbd7c2] overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-[#8b8d70]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#2f3b1f] line-clamp-1">{product.name}</p>
                        <p className="text-xs font-medium text-[#7b7a60] mt-0.5">{product.weight} &bull; Stock: {product.stock_quantity}</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-[#f4efdf] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-rice-green)] transition-colors">
                        <PlusCircle className="h-4 w-4 text-[#8b8d70] group-hover:text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-6">
                  <Package className="h-10 w-10 text-[#c2c0b0] mb-3" />
                  <p className="text-sm font-bold text-[#6d7452]">No products available</p>
                  <p className="text-xs font-medium text-[#9a987b] mt-1 max-w-[250px]">
                    {searchQuery ? "No matches found for your search." : "All active products have been added to the manifest."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Delivery Manifest */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#7b7a60]">Delivery Manifest</h3>
            
            <div className="rounded-[1.4rem] border border-[#ddd9c6] bg-white p-5 shadow-[0_12px_30px_rgba(78,95,58,0.06)] flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {manifest.length > 0 ? manifest.map(item => (
                  <div key={item.id} className="rounded-2xl border border-[color:var(--color-rice-green)] bg-[#edf4e4]/30 p-4 relative group">
                    <button 
                      onClick={() => removeFromManifest(item.id)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-[#e5e0cc] text-[#a14c34] hover:bg-[#fff4ef] shadow-sm transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-bold text-[#2f3b1f] pr-4 line-clamp-1">{item.name}</p>
                    <p className="text-xs font-medium text-[#7b7a60] mt-1 mb-3">Current Stock: {item.stock_quantity}</p>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-rice-green)]">Receive:</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Qty"
                        value={item.added_quantity}
                        onChange={(e) => updateManifestQuantity(item.id, e.target.value)}
                        className="w-20 rounded-xl border border-[#cacfbb] bg-white px-3 py-2 text-sm font-bold text-[#2f3b1f] outline-none focus:border-[color:var(--color-rice-green)] transition-all"
                      />
                      <span className="text-[11px] font-bold text-[#6d7452]">
                        &rarr; New Total: {(item.stock_quantity + (parseInt(item.added_quantity) || 0))}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="rounded-2xl bg-[#faf7ee] p-4 text-[#8b8d70] mb-3 border border-[#dbd7c2]">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-[#6d7452]">Manifest is empty</p>
                    <p className="text-xs font-medium text-[#9a987b] mt-1 max-w-[200px]">
                      Click a product on the left to add it to your delivery manifest.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#f0ede1]">
                <button
                  disabled={!canSubmit || isSubmitting}
                  onClick={submitManifest}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--color-rice-green)] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#3d5a2b] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Saving Delivery...</>
                  ) : (
                    <><CheckCircle2 className="h-5 w-5" /> Confirm Delivery</>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </AdminShell>
  );
}
