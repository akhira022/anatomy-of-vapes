import { Suspense } from "react";
import { PageLoading } from "@/components/feedback/PageLoading";

export default function AnatomyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PageLoading label="กำลังโหลดโมเดล…" />}>
      {children}
    </Suspense>
  );
}
