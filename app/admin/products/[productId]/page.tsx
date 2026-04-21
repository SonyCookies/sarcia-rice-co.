import AdminShell from "@/app/admin/_components/admin-shell";
import EditProductContent from "./_components/edit-product-content";

export default function EditProductPage() {
  return (
    <AdminShell
      subtitle="Update catalog product details."
      searchPlaceholder="Search products by name"
    >
      <EditProductContent />
    </AdminShell>
  );
}
