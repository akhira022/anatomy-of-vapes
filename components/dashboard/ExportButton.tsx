"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { AdminResultRow } from "@/lib/db";

interface ExportButtonProps {
  rows: AdminResultRow[];
}

export function ExportButton({ rows }: ExportButtonProps) {
  const handleExport = () => {
    const headers = [
      "email",
      "nickname",
      "grade",
      "pre_score",
      "post_score",
      "improvement",
      "created_at",
    ];
    const data = rows.map((r) => ({
      email: r.email ?? "",
      nickname: r.nickname,
      grade: r.grade,
      pre_score: r.pre_score,
      post_score: r.post_score,
      improvement: r.improvement,
      created_at: r.created_at,
    }));
    const csv = toCsv(data, headers);
    downloadCsv(`anatomy-of-vapes-results-${Date.now()}.csv`, csv);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-xl"
      disabled={rows.length === 0}
      onClick={handleExport}
    >
      <Download className="size-4" />
      ส่งออก CSV
    </Button>
  );
}
