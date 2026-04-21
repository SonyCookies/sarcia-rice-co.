"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Package,
  Save,
  Trash2,
  X,
  FileText,
  DollarSign,
  Scale,
  Hash,
  AlertCircle,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";

type ProductImage = {
  id: number;
  image_url: string;
  image_path: string;
  sort_order: number;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  weight: string;
  image_url: string | null;
  images: ProductImage[];
  stock_quantity: number;
  stock_status: string;
  low_stock_threshold: number;
  is_archived: boolean;
};

type ProductFormProps = {
  initialData?: Product;
};

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name ?? "");
  const [price, setPrice] = useState(initialData?.price.toString() ?? "");
  const [weightValue, setWeightValue] = useState(() => {
    if (!initialData?.weight) return "";
    return initialData.weight.split(" ")[0] || "";
  });
  const [weightUnit, setWeightUnit] = useState(() => {
    if (!initialData?.weight) return "kg";
    return initialData.weight.split(" ")[1] || "kg";
  });

  const [showRestock, setShowRestock] = useState(false);
  const [restockAmount, setRestockAmount] = useState("");

  const [description, setDescription] = useState(initialData?.description ?? "");
  const [stockQuantity, setStockQuantity] = useState(initialData?.stock_quantity.toString() ?? "0");
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.low_stock_threshold?.toString() ?? "10");
  const [isForceUnavailable, setIsForceUnavailable] = useState(initialData?.stock_status === "unavailable");
  const [isArchived, setIsArchived] = useState(initialData?.is_archived ?? false);

  const computedStatus = useMemo(() => {
    if (isForceUnavailable) return "unavailable";
    const qty = parseInt(stockQuantity) || 0;
    const threshold = parseInt(lowStockThreshold) || 10;
    if (qty <= 0) return "out_of_stock";
    if (qty <= threshold) return "low_stock";
    return "in_stock";
  }, [stockQuantity, lowStockThreshold, isForceUnavailable]);

  const weight = useMemo(() => `${weightValue} ${weightUnit}`.trim(), [weightValue, weightUnit]);
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null);

  // Multi-image state
  const [existingImages, setExistingImages] = useState<ProductImage[]>(
    initialData?.images ?? []
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  const productInitials = useMemo(() => {
    if (!name.trim()) return "RP";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }, [name]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length) {
      setError("One or more images exceeded 5MB and were skipped.");
    }
    setNewImageFiles(prev => [...prev, ...valid]);
    const previews = valid.map(f => URL.createObjectURL(f));
    setNewImagePreviews(prev => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const queueDeleteExisting = (imageId: number) => {
    setDeletedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("weight", weight);
      formData.append("description", description);
      formData.append("stock_quantity", stockQuantity);
      formData.append("low_stock_threshold", lowStockThreshold);
      formData.append("stock_status", isForceUnavailable ? "unavailable" : "auto");
      formData.append("is_archived", isArchived ? "true" : "false");
      
      // Append new images
      newImageFiles.forEach(file => formData.append("images[]", file));
      // Append queued deletions
      deletedImageIds.forEach(id => formData.append("delete_image_ids[]", id.toString()));

      const url = initialData
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");
      
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-semibold text-[color:var(--color-rice-green)] transition hover:bg-[#f4efdf]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#c4701e_0%,#d98c21_48%,#ecab4f_100%)] px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,#f3e8c9_22%,transparent),transparent_22%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_12%,transparent),transparent_30%)] opacity-30" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f7efd5]">
                {initialData ? "Product Management" : "Add New Product"}
              </p>
              <h1 className="mt-3 font-poppins text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {name || "Unnamed Product"}
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#fffbf2] sm:text-base">
                {initialData 
                  ? "Update product pricing, availability, and presentation details."
                  : "Configure the specifications and stock for this new rice offering."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm border border-white/20 capitalize ${
                  computedStatus === 'in_stock' ? 'bg-[#edf4e4]/30 text-white' : 
                  computedStatus === 'low_stock' ? 'bg-[#fdebba]/30 text-white' :
                  'bg-[#fff0ea]/30 text-white'
                }`}>
                  {computedStatus.replace('_', ' ')}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm border border-white/20 ${
                  isArchived ? "bg-black/30 text-white" : "bg-white/20 text-white"
                }`}>
                  {isArchived ? "Archived" : "Active Visibility"}
                </span>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[290px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#f2e7c9]">
                Product Snapshot
              </p>
              <div className="mt-4 grid gap-3 text-sm text-[#fffdf7]">
                <div className="flex items-center justify-between gap-4">
                  <span>Weight</span>
                  <span className="font-semibold text-white">{weight || "---"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Current Stock</span>
                  <span className="font-semibold text-white">{stockQuantity} units</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Unit Price</span>
                  <span className="font-semibold text-white">₱{Number(price || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-white bg-[linear-gradient(135deg,#c4701e,#ecab4f)] text-2xl font-semibold text-white shadow-[0_18px_44px_rgba(196,112,30,0.28)] sm:h-28 sm:w-28 sm:text-3xl">
              {productInitials}
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-poppins text-2xl font-semibold text-[#2f3b1f] sm:text-3xl">
                  {initialData ? "Modify Variant" : "Product Creation"}
                </p>
                <p className="mt-1 text-sm text-[#6d7452]">
                  Ensure all information is accurate before deployment to customer catalog.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              General Information
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7b7a60]">
                  Product Title
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                    <Package className="h-4 w-4" />
                  </div>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rice Variety Name"
                    className="w-full rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm font-semibold text-[#2f3b1f] outline-none transition placeholder:text-[#9a9b7d] border-[#d8d4be] focus:border-[color:var(--color-rice-green)] focus:ring-1 focus:ring-[color:var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7b7a60]">
                  Description
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute top-3.5 left-4 flex items-center text-[#8d8f69]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Narrative description of the rice product..."
                    className="w-full resize-none rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm font-semibold text-[#2f3b1f] outline-none transition placeholder:text-[#9a9b7d] border-[#d8d4be] focus:border-[color:var(--color-rice-green)] focus:ring-1 focus:ring-[color:var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6" id="pricing-physicals">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Pricing & Physicals
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7b7a60]">
                  Price (₱)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69] font-bold">
                    ₱
                  </div>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setPrice(val);
                      }
                    }}
                    placeholder="0.00"
                    className="w-full rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm font-semibold text-[#2f3b1f] outline-none transition placeholder:text-[#9a9b7d] border-[#d8d4be] focus:border-[color:var(--color-rice-green)] focus:ring-1 focus:ring-[color:var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7b7a60]">
                  Weight / Size
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69] z-10">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div className="flex w-full overflow-hidden rounded-xl border bg-[#fffef9] border-[#d8d4be] focus-within:border-[color:var(--color-rice-green)] focus-within:ring-1 focus-within:ring-[color:var(--color-rice-green)] transition">
                    <input
                      required
                      value={weightValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          setWeightValue(val);
                        }
                      }}
                      placeholder="Value"
                      className="w-full bg-transparent py-3 pl-11 pr-2 text-sm font-semibold text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
                    />
                    <div className="flex items-center pr-3 border-l border-[#e5e0cc] my-2 pl-3 bg-[#fffef9]">
                      <select
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                        className="bg-transparent text-sm font-bold text-[color:var(--color-rice-green)] outline-none cursor-pointer"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="sack">sack</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Inventory Status
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 ml-1 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-[#7b7a60]">
                    <span>Stock Quantity</span>
                    {initialData && !showRestock && (
                      <button
                        type="button"
                        onClick={() => setShowRestock(true)}
                        className="text-[10px] font-bold text-[color:var(--color-rice-green)] hover:underline"
                      >
                        + ADD STOCK
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                      <Hash className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={stockQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) {
                          setStockQuantity(val);
                        }
                      }}
                      className={`w-full rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-[#9a9b7d] border-[#d8d4be] focus:border-[color:var(--color-rice-green)] focus:ring-1 focus:ring-[color:var(--color-rice-green)] ${showRestock ? "text-[#9a9b7d] bg-[#f4f2ea]" : "text-[#2f3b1f]"}`}
                      readOnly={showRestock}
                    />
                  </div>
                </div>
                {showRestock && (
                  <div className="flex items-center gap-2 rounded-xl bg-[#faf7ee] p-2 border border-[#e5e0cc] shadow-inner">
                    <div className="pl-3 py-1 flex items-center justify-center shrink-0">
                       <Plus className="h-4 w-4 text-[#8d8f69]" />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      value={restockAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) setRestockAmount(val);
                      }}
                      placeholder="Incoming qty"
                      className="w-full bg-transparent text-sm font-bold text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (restockAmount) {
                          setStockQuantity(String((parseInt(stockQuantity) || 0) + parseInt(restockAmount)));
                          setRestockAmount("");
                          setShowRestock(false);
                        }
                      }}
                      className="shrink-0 rounded-lg bg-[var(--color-rice-green)] px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-[#3d5a2b]"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRestockAmount("");
                        setShowRestock(false);
                      }}
                      className="shrink-0 rounded-lg border border-[#dbd7c2] bg-white p-2 text-[#8b8d70] hover:bg-[#fffef9]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7b7a60]">
                  Low Stock Alert At
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={lowStockThreshold}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*$/.test(val)) {
                        setLowStockThreshold(val);
                      }
                    }}
                    placeholder="e.g. 10"
                    className="w-full rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm font-semibold text-[#2f3b1f] outline-none transition placeholder:text-[#9a9b7d] border-[#d8d4be] focus:border-[color:var(--color-rice-green)] focus:ring-1 focus:ring-[color:var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7b7a60]">
                  Availability System
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="flex w-full items-center justify-between rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm border-[#d8d4be] shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        computedStatus === 'in_stock' ? 'bg-[#4d6b35]' : 
                        computedStatus === 'low_stock' ? 'bg-[#b57317]' :
                        'bg-[#8f3d23]'
                      }`} />
                      <span className="font-semibold text-[#2f3b1f] capitalize">
                        {computedStatus.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-[#6d7452] font-medium hidden sm:inline"> (Auto-calculated)</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer rounded-lg pl-3 pr-1 py-1 transition hover:bg-[#fff0ea]">
                      <input 
                        type="checkbox" 
                        checked={isForceUnavailable} 
                        onChange={(e) => setIsForceUnavailable(e.target.checked)}
                        className="h-4 w-4 rounded border-[#dbd7c2] text-[#a14c34] focus:ring-[#a14c34] focus-visible:ring-2" 
                      />
                      <span className="text-sm font-semibold text-[#a14c34]">Force Unavailable</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                Product Images
              </p>
              <span className="text-xs font-medium text-[#9a9b7d]">
                {existingImages.length + newImageFiles.length} photo{existingImages.length + newImageFiles.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {existingImages.map((img, index) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-[#dbd7c2] bg-[#f4f2ea]">
                  <img src={img.image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-[color:var(--color-rice-green)] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => queueDeleteExisting(img.id)}
                    className="absolute right-2 top-2 rounded-full bg-[#a14c34] p-1.5 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-[color:var(--color-rice-green)] bg-[#edf4e4]/30">
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-full bg-[#4d6b35] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-[#a14c34] p-1.5 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#dbd7c2] bg-[#faf7ee] transition hover:border-[color:var(--color-rice-green)] hover:bg-[#f4efe0]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8b8d70] shadow-sm">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[#6d7452]">Add Photos</span>
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#9a9b7d]">
              First image is the primary photo. Hover to remove.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImagesChange}
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              multiple
              className="hidden"
            />
          </div>

          <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Management Controls
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <p className="text-sm font-semibold text-[#2f3b1f]">
                  Product Visibility
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                  Control whether this product appears in the customer-facing catalog.
                </p>
                <button
                  type="button"
                  onClick={() => setIsArchived(!isArchived)}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isArchived
                      ? "bg-[#253119] text-white hover:bg-[#1c2512]"
                      : "bg-[#6b2f1f]/10 text-[#6b2f1f] border border-[#6b2f1f]/20 hover:bg-[#6b2f1f]/20"
                  }`}
                >
                  {isArchived ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Publish to Catalog
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Archive Product
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--color-rice-green)] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(77,107,53,0.24)] transition hover:bg-opacity-90 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {initialData ? "Apply Changes" : "Deploy Product"}
                    </>
                  )}
                </button>

                {initialData && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white py-3.5 text-sm font-semibold text-[#a14c34] transition hover:bg-[#fff4ef] disabled:opacity-70"
                  >
                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    Delete Offering
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
