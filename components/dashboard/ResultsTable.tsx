"use client";

import type { AdminResultRow } from "@/lib/db";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  rows: AdminResultRow[];
  limit?: number;
}

export function ResultsTable({ rows, limit = 50 }: ResultsTableProps) {
  const visibleRows = rows.slice(0, limit);

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-textSecondary">
        ยังไม่มีข้อมูลผลคะแนน
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {visibleRows.map((row) => (
          <article
            key={row.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-textPrimary">
                  {row.nickname}
                </p>
                <p className="text-xs text-textSecondary">{row.grade}</p>
              </div>
              <p className="shrink-0 text-xs text-textDisabled">
                {new Date(row.created_at).toLocaleDateString("th-TH")}
              </p>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <dt className="text-xs text-textSecondary">ก่อน</dt>
                <dd className="font-semibold text-textPrimary">
                  {row.pre_score}/{row.pre_total}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-textSecondary">หลัง</dt>
                <dd className="font-semibold text-textPrimary">
                  {row.post_score}/{row.post_total}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-textSecondary">พัฒนา</dt>
                <dd
                  className={cn(
                    "font-semibold",
                    row.improvement > 0 ? "text-success" : "text-textSecondary"
                  )}
                >
                  {row.improvement > 0 ? "+" : ""}
                  {row.improvement}
                </dd>
              </div>
            </dl>
          </article>
        ))}
        {rows.length > limit ? (
          <p className="text-center text-xs text-textDisabled">
            แสดง {limit} รายการแรกจากทั้งหมด {rows.length} รายการ
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
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
            {visibleRows.map((row) => (
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
        {rows.length > limit ? (
          <p className="border-t border-border px-3 py-2 text-center text-xs text-textDisabled">
            แสดง {limit} รายการแรกจากทั้งหมด {rows.length} รายการ
          </p>
        ) : null}
      </div>
    </>
  );
}
