"use client";

import type { AdminResultRow } from "@/lib/db";

interface ResultsTableProps {
  rows: AdminResultRow[];
}

export function ResultsTable({ rows }: ResultsTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-textSecondary">
        ยังไม่มีข้อมูลผลคะแนน
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface text-textSecondary">
          <tr>
            <th className="px-3 py-3 font-medium">ชื่อเล่น</th>
            <th className="px-3 py-3 font-medium">ชั้น</th>
            <th className="px-3 py-3 font-medium">ก่อน</th>
            <th className="px-3 py-3 font-medium">หลัง</th>
            <th className="px-3 py-3 font-medium">พัฒนา</th>
            <th className="px-3 py-3 font-medium">วันที่</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border bg-card">
              <td className="px-3 py-3 text-textPrimary">{row.nickname}</td>
              <td className="px-3 py-3 text-textSecondary">{row.grade}</td>
              <td className="px-3 py-3 text-textPrimary">
                {row.pre_score}/{row.pre_total}
              </td>
              <td className="px-3 py-3 text-textPrimary">
                {row.post_score}/{row.post_total}
              </td>
              <td
                className={
                  row.improvement > 0
                    ? "px-3 py-3 font-medium text-success"
                    : "px-3 py-3 text-textSecondary"
                }
              >
                {row.improvement > 0 ? "+" : ""}
                {row.improvement}
              </td>
              <td className="px-3 py-3 text-textDisabled">
                {new Date(row.created_at).toLocaleDateString("th-TH")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
