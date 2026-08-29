import { Suspense } from "react";
import { PageLoading } from "@/components/feedback/PageLoading";
import { AdminDashboard } from "./AdminDashboard";

export default function AdminPage() {
  return (
    <Suspense fallback={<PageLoading label="กำลังโหลดแดชบอร์ด…" />}>
      <AdminDashboard />
    </Suspense>
  );
}
