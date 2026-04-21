import { Metadata } from "next";
import BulkRestockContent from "./_components/bulk-restock-content";

export const metadata: Metadata = {
  title: "Bulk Restock | Sarcia Rice Co.",
};

export default function BulkRestockPage() {
  return <BulkRestockContent />;
}
