"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Filter,
  Plus,
  Search,
  Package,
  PlusCircle,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  weight: string;
  image_url: string | null;
  stock_quantity: number;
  stock_status: string;
  low_stock_threshold: number;
  is_archived: boolean;
  created_at: string;
};

type ProductsResponse = {
  message?: string;
  products?: Product[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  summary?: {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
};

const emptySummary = {
  total_products: 0,
  low_stock_count: 0,
  out_of_stock_count: 0,
};

const emptyPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
};

export default function ProductsPageContent() {
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archivedFilter, setArchivedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [pagination, setPagination] = useState(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRestockProduct, setSelectedRestockProduct] = useState<Product | null>(null);
  const [quickRestockAmount, setQuickRestockAmount] = useState("");
  const [isRestocking, setIsRestocking] = useState(false);

  const debouncedSearch = useMemo(() => searchInput.trim(), [searchInput]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [debouncedSearch, statusFilter, archivedFilter]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "12",
          status: statusFilter,
          archived: archivedFilter,
        });

        if (debouncedSearch !== "") {
          params.set("q", debouncedSearch);
        }

        const response = await fetch(`/api/admin/products?${params.toString()}`, {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as ProductsResponse | null;

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setError(data?.message ?? "Unable to load the product directory right now.");
          setProducts([]);
          return;
        }

        setProducts(data?.products ?? []);
        setSummary(data?.summary ?? emptySummary);
        setPagination(data?.pagination ?? emptyPagination);
      } catch {
        if (isMounted) {
          setError("Something went wrong while loading the product directory.");
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, statusFilter, archivedFilter]);

  const handleQuickRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockProduct || !quickRestockAmount) return;

    setIsRestocking(true);
    try {
      const response = await fetch(`/api/admin/products/${selectedRestockProduct.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ added_quantity: parseInt(quickRestockAmount) }),
      });

      if (!response.ok) throw new Error("Failed to restock");

      const data = await response.json();
      
      // Update local state without full reload
      setProducts(current => 
        current.map(p => p.id === selectedRestockProduct.id ? data.product : p)
      );
      
      setSelectedRestockProduct(null);
      setQuickRestockAmount("");
    } catch (err: any) {
      alert(err.message || "Failed to restock product");
    } finally {
      setIsRestocking(false);
    }
  };

  return (
    <AdminShell
      subtitle="Manage rice products, update prices, and track inventory."
      searchPlaceholder="Search products by name"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative bg-[linear-gradient(135deg,#c4701e_0%,#d98c21_52%,#ecab4f_100%)] px-5 py-7 text-white sm:px-7 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,#f3e8c9_22%,transparent),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_10%,transparent),transparent_28%)] opacity-30" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f7efd5]">
                Inventory Management
              </p>
              <h1 className="mt-3 font-poppins text-3xl font-semibold sm:text-4xl text-white">
                Review and update your product catalog.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#fffbf2] sm:text-base">
                Track available stock, update current prices, manage out-of-stock items, and add new rice variants.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#f2e7c9]">
                Inventory summary
              </p>
              <div className="mt-3 grid gap-2 text-sm text-[#fffdf7]">
                <div className="flex items-center justify-between gap-4">
                  <span>Total active products</span>
                  <span className="font-semibold text-white">
                    {summary.total_products}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Low stock alerts</span>
                  <span className="font-semibold text-[#fdebba]">
                    {summary.low_stock_count}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Out of stock</span>
                  <span className="font-semibold text-[#fde4d8]">
                    {summary.out_of_stock_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold font-poppins text-[#2f3b1f]">Products Catalog</h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/products/bulk-restock"
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-white border border-[#d8d4be] px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold text-[#364127] shadow-sm transition hover:bg-[#faf7ee]"
          >
            <Package className="h-4 w-4 shrink-0" />
            <span>Bulk Restock</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-[var(--color-rice-green)] px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(77,107,53,0.2)] transition hover:bg-[#3d5a2b]"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Product</span>
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7b7a60]">
              Search Products
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-[#dbd7c2] bg-[#fffef9] px-4 py-3 shadow-[0_10px_24px_rgba(78,95,58,0.04)]">
              <Search className="h-4 w-4 text-[#8b8d70]" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name"
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7b7a60]">
              Status
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-[#dbd7c2] bg-[#fffef9] px-4 py-3">
              <Filter className="h-4 w-4 text-[#8b8d70]" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none"
              >
                <option value="all">All statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7b7a60]">
              Visibility
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-[#dbd7c2] bg-[#fffef9] px-4 py-3">
              <Package className="h-4 w-4 text-[#8b8d70]" />
              <select
                value={archivedFilter}
                onChange={(event) => setArchivedFilter(event.target.value)}
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none"
              >
                <option value="all">Active Only</option>
                <option value="with_archived">Show Archived</option>
                <option value="only_archived">Archived Only</option>
              </select>
            </div>
          </label>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[1.6rem] border border-[#e5e0cc] bg-[#faf7ee] h-64"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-[#e5e0cc] bg-white transition hover:shadow-[0_18px_40px_rgba(78,95,58,0.12)] hover:border-[#cacfbb]"
                >
                  <div className="relative aspect-[4/3] w-full bg-[#f4f2ea] overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#c2c0b0]">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-sm ${
                         product.stock_status === 'in_stock' ? 'bg-[#edf4e4]/90 text-[#4d6b35]' : 
                         product.stock_status === 'low_stock' ? 'bg-[#fdebba]/90 text-[#b57317]' :
                         'bg-[#fff0ea]/90 text-[#8f3d23]'
                       }`}>
                         {product.stock_status.replace('_', ' ').toUpperCase()}
                       </span>
                       {product.is_archived && (
                         <span className="inline-block rounded-full bg-[#364127]/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
                           ARCHIVED
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-poppins text-lg font-semibold text-[#2f3b1f] line-clamp-1">{product.name}</h3>
                      <p className="shrink-0 font-poppins text-lg font-bold text-[var(--color-rice-green)]">
                        ₱{Number(product.price).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-[#7b7a60]">{product.weight}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between text-sm border-t border-[#f0ede1]">
                      <span className="text-[#6d7452]">
                        Stock: <span className="font-semibold text-[#2f3b1f]">{product.stock_quantity}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedRestockProduct(product);
                            setQuickRestockAmount("");
                          }}
                          className="flex items-center gap-1 rounded bg-[#edf4e4] px-2 py-1 text-xs font-bold text-[#4d6b35] hover:bg-[#d5e3c7] transition"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Restock
                        </button>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-[#ddd7c4] bg-white/85 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#6d7452]">
                Showing page <span className="font-semibold text-[#2f3b1f]">{pagination.current_page}</span> of <span className="font-semibold text-[#2f3b1f]">{pagination.last_page}</span> 
                {' '}({pagination.total} products)
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.current_page <= 1}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-white px-4 py-2.5 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(pagination.last_page, current + 1))}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Next Page
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-[1.6rem] border border-[#e5e0cc] bg-[#faf7ee] p-5 lg:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
              <Package className="h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-semibold text-[#364127]">
              No products found
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6d7452]">
              We couldn't find any products matching your current filters. Try relaxing your search criteria or add a new product.
            </p>
            <Link
              href="/admin/products/new"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-rice-green)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d5a2b]"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Link>
          </div>
        )}
      </section>

      {/* Quick Restock Modal */}
      {selectedRestockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f3b1f]/40 p-4 backdrop-blur-sm sm:p-6" onClick={() => !isRestocking && setSelectedRestockProduct(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-[linear-gradient(135deg,#c4701e,#ecab4f)] px-6 py-5 text-white">
              <h3 className="font-poppins text-xl font-bold">Quick Restock</h3>
              <p className="mt-1 text-sm text-[#fffbf2]/90 line-clamp-1">{selectedRestockProduct.name}</p>
            </div>
            <form onSubmit={handleQuickRestock} className="p-6">
              <div className="flex items-center justify-between text-sm font-semibold text-[#6d7452] mb-6">
                <span>Current Stock: <span className="text-[#2f3b1f] text-lg ml-1">{selectedRestockProduct.stock_quantity}</span></span>
                <span className="bg-[#edf4e4] px-2 py-0.5 rounded text-[#4d6b35] text-xs">+{quickRestockAmount || "0"}</span>
              </div>
              <label className="block mb-6">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#9a987b]">Incoming Quantity</span>
                <input
                  type="number"
                  required
                  min="1"
                  autoFocus
                  placeholder="e.g. 50"
                  value={quickRestockAmount}
                  onChange={e => setQuickRestockAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#d8d4be] bg-[#faf7ee] px-4 py-3 text-sm font-bold text-[#2f3b1f] outline-none focus:border-[var(--color-rice-green)] focus:ring-1 focus:ring-[var(--color-rice-green)]"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isRestocking}
                  onClick={() => setSelectedRestockProduct(null)}
                  className="flex-1 rounded-xl border border-[#d8d4be] bg-white py-3 text-sm font-bold text-[#8b8d70] hover:bg-[#faf7ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestocking || !quickRestockAmount}
                  className="flex-1 rounded-xl bg-[var(--color-rice-green)] py-3 text-sm font-bold text-white shadow-lg hover:bg-[#3d5a2b] disabled:opacity-70 flex justify-center items-center"
                >
                  {isRestocking ? "Saving..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
