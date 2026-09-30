"use client";

import { getRefusalSkillById } from "@/data/refusal-skills";
import type { AdminRefusalPracticeRow } from "@/lib/db";

interface PracticeTableProps {
  rows: AdminRefusalPracticeRow[];
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function PracticeTable({ rows }: PracticeTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-textSecondary">
        ยังไม่มีข้อมูลการฝึกปฏิเสธ
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className="bg-surface-2 text-textSecondary">
          <tr>
            <th className="px-3 py-2 font-medium">เวลา</th>
            <th className="px-3 py-2 font-medium">ชื่อเล่น</th>
            <th className="px-3 py-2 font-medium">สถานการณ์</th>
            <th className="px-3 py-2 font-medium">ประโยคที่เลือก</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const skill = getRefusalSkillById(row.situation_id);
            return (
              <tr key={row.id} className="border-t border-border bg-card">
                <td className="px-3 py-2 text-textSecondary whitespace-nowrap">
                  {formatWhen(row.updated_at || row.created_at)}
                </td>
                <td className="px-3 py-2 text-textPrimary">
                  {row.nickname || "—"}
                </td>
                <td className="px-3 py-2 text-textPrimary">
                  {skill?.situation ?? row.situation_id}
                </td>
                <td className="px-3 py-2 text-textPrimary">
                  {row.selected_phrase}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
