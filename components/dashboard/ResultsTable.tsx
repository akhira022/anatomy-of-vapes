"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { EditResultDialog } from "@/components/dashboard/EditResultDialog";
import { Button } from "@/components/ui/button";
import {
  adminDeleteLearner,
  adminDeleteResult,
  type AdminResultRow,
} from "@/lib/db";
import { ageRangeLabels } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { AgeRange } from "@/types";

interface ResultsTableProps {
  rows: AdminResultRow[];
  limit?: number;
  onChanged?: () => void;
}

function userTypeLabel(userType: string) {
  return userType === "guest" ? "ผู้ชม" : "สมาชิก";
}

function flowTypeLabel(flowType: string) {
  return flowType === "guest" ? "ผู้ชม" : "ครบ";
}

function ageLabel(ageRange: string | null) {
  if (!ageRange) return "—";
  return ageRangeLabels[ageRange as AgeRange] ?? ageRange;
}

export function ResultsTable({
  rows,
  limit = 50,
  onChanged,
}: ResultsTableProps) {
  const visibleRows = rows.slice(0, limit);
  const [editRow, setEditRow] = useState<AdminResultRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    row: AdminResultRow;
    mode: "result" | "user";
  } | null>(null);

  const confirmDelete = (target: {
    row: AdminResultRow;
    mode: "result" | "user";
  }) => {
    void (async () => {
      const result =
        target.mode === "user"
          ? await adminDeleteLearner(target.row.user_id)
          : await adminDeleteResult(target.row.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        target.mode === "user"
          ? "ลบผู้เรียนและข้อมูลที่เกี่ยวข้องแล้ว"
          : "ลบผลคะแนนแล้ว"
      );
      onChanged?.();
    })();
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-textSecondary">
        ยังไม่มีข้อมูลผลคะแนน
      </p>
    );
  }

  const actions = (row: AdminResultRow) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={`แก้ไข ${row.nickname}`}
        onClick={() => setEditRow(row)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={`ลบผลคะแนนของ ${row.nickname}`}
        className="text-error hover:text-error"
        onClick={() => setDeleteTarget({ row, mode: "result" })}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

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
                <p className="text-xs text-textSecondary">
                  {row.grade} · {ageLabel(row.age_range)}
                </p>
                <p className="mt-1 text-xs text-textDisabled">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5",
                      row.user_type === "guest"
                        ? "bg-surface-2 text-textSecondary"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {userTypeLabel(row.user_type)}
                  </span>
                  {" · "}
                  {flowTypeLabel(row.flow_type)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-xs text-textDisabled">
                  {new Date(row.created_at).toLocaleDateString("th-TH")}
                </p>
                {actions(row)}
              </div>
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
                  {row.flow_type === "guest"
                    ? "—"
                    : `${row.post_score}/${row.post_total}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-textSecondary">พัฒนา</dt>
                <dd
                  className={cn(
                    "font-semibold",
                    row.flow_type === "guest"
                      ? "text-textDisabled"
                      : row.improvement > 0
                        ? "text-success"
                        : "text-textSecondary"
                  )}
                >
                  {row.flow_type === "guest"
                    ? "—"
                    : `${row.improvement > 0 ? "+" : ""}${row.improvement}`}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-error"
                onClick={() => setDeleteTarget({ row, mode: "user" })}
              >
                ลบผู้เรียนทั้งหมด
              </Button>
            </div>
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
              <th className="px-3 py-3 font-medium">อายุ</th>
              <th className="px-3 py-3 font-medium">ประเภท</th>
              <th className="px-3 py-3 font-medium">ก่อน</th>
              <th className="px-3 py-3 font-medium">หลัง</th>
              <th className="px-3 py-3 font-medium">พัฒนา</th>
              <th className="px-3 py-3 font-medium">วันที่</th>
              <th className="px-3 py-3 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-t border-border bg-card">
                <td className="px-3 py-3 text-textPrimary">{row.nickname}</td>
                <td className="px-3 py-3 text-textSecondary">{row.grade}</td>
                <td className="px-3 py-3 text-textSecondary">
                  {ageLabel(row.age_range)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs",
                      row.user_type === "guest"
                        ? "bg-surface-2 text-textSecondary"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {userTypeLabel(row.user_type)}
                  </span>
                </td>
                <td className="px-3 py-3 text-textPrimary">
                  {row.pre_score}/{row.pre_total}
                </td>
                <td className="px-3 py-3 text-textPrimary">
                  {row.flow_type === "guest"
                    ? "—"
                    : `${row.post_score}/${row.post_total}`}
                </td>
                <td
                  className={
                    row.flow_type === "guest"
                      ? "px-3 py-3 text-textDisabled"
                      : row.improvement > 0
                        ? "px-3 py-3 font-medium text-success"
                        : "px-3 py-3 text-textSecondary"
                  }
                >
                  {row.flow_type === "guest"
                    ? "—"
                    : `${row.improvement > 0 ? "+" : ""}${row.improvement}`}
                </td>
                <td className="px-3 py-3 text-textDisabled">
                  {new Date(row.created_at).toLocaleDateString("th-TH")}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    {actions(row)}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-xs text-error"
                      onClick={() => setDeleteTarget({ row, mode: "user" })}
                    >
                      ลบผู้เรียน
                    </Button>
                  </div>
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

      <EditResultDialog
        row={editRow}
        open={Boolean(editRow)}
        onOpenChange={(open) => {
          if (!open) setEditRow(null);
        }}
        onSaved={() => onChanged?.()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        destructive
        title={
          deleteTarget?.mode === "user"
            ? "ลบผู้เรียนทั้งหมด?"
            : "ลบผลคะแนนรายการนี้?"
        }
        description={
          deleteTarget?.mode === "user"
            ? `จะลบโปรไฟล์ของ “${deleteTarget.row.nickname}” พร้อมผลคะแนน ความยินยอม และคำตอบทั้งหมด ไม่สามารถกู้คืนได้`
            : `จะลบเฉพาะผลคะแนนของ “${deleteTarget?.row.nickname ?? ""}” โปรไฟล์ผู้เรียนยังคงอยู่`
        }
        confirmLabel="ลบ"
        onConfirm={() => {
          if (deleteTarget) confirmDelete(deleteTarget);
        }}
      />
    </>
  );
}
