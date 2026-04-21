import AdminShell from "@/app/admin/_components/admin-shell";
import ProductForm from "../_components/product-form";

export default function NewProductPage() {
  return (
    <AdminShell
      subtitle="Expand your catalog by adding a new product."
      searchPlaceholder="Search products by name"
    >
      <ProductForm />
    </AdminShell>
  );
}
