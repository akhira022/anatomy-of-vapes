"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminResultRow } from "@/lib/db";
import { adminUpdateLearner } from "@/lib/db";
import {
  ageRangeLabels,
  ageRangeOptions,
  gradeOptions,
} from "@/lib/validations";
import type { AgeRange, Grade } from "@/types";

interface EditResultDialogProps {
  row: AdminResultRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function resolveGrade(value: string): Grade {
  return (gradeOptions as readonly string[]).includes(value)
    ? (value as Grade)
    : "อื่นๆ";
}

function resolveAge(value: string | null): AgeRange | "" {
  if (value && (ageRangeOptions as readonly string[]).includes(value)) {
    return value as AgeRange;
  }
  return "";
}

function EditResultForm({
  row,
  onOpenChange,
  onSaved,
}: {
  row: AdminResultRow;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [nickname, setNickname] = useState(row.nickname);
  const [grade, setGrade] = useState<Grade>(() => resolveGrade(row.grade));
  const [ageRange, setAgeRange] = useState<AgeRange | "">(() =>
    resolveAge(row.age_range)
  );
  const [email, setEmail] = useState(row.email ?? "");
  const [preScore, setPreScore] = useState(row.pre_score);
  const [postScore, setPostScore] = useState(row.post_score);
  const [preTotal, setPreTotal] = useState(row.pre_total);
  const [postTotal, setPostTotal] = useState(row.post_total);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      toast.error("ชื่อต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }
    setSaving(true);
    const result = await adminUpdateLearner(row.user_id, {
      nickname: trimmed,
      grade,
      age_range: ageRange || null,
      email: email.trim() ? email.trim() : null,
      result_id: row.id,
      pre_score: preScore,
      post_score: postScore,
      pre_total: preTotal,
      post_total: postTotal,
    });
    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("บันทึกการแก้ไขแล้ว");
    onOpenChange(false);
    onSaved();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>แก้ไขข้อมูลผู้เรียน</DialogTitle>
        <DialogDescription>
          แก้โปรไฟล์และคะแนนของรายการนี้ — ค่าพัฒนาการคำนวณอัตโนมัติจากคะแนนหลัง − ก่อน
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <FormField id="edit-nickname" label="ชื่อเล่น" required>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
        </FormField>

        <FormField id="edit-email" label="อีเมล">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ว่างได้ถ้าเป็นผู้ชม"
          />
        </FormField>

        <div className="space-y-2">
          <label
            htmlFor="edit-grade"
            className="text-sm font-medium text-textPrimary"
          >
            ระดับชั้น
          </label>
          <Select
            value={grade}
            onValueChange={(value) => {
              if (value) setGrade(value as Grade);
            }}
          >
            <SelectTrigger id="edit-grade" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-age"
            className="text-sm font-medium text-textPrimary"
          >
            ช่วงอายุ
          </label>
          <Select
            value={ageRange || null}
            onValueChange={(value) => {
              setAgeRange((value as AgeRange) || "");
            }}
          >
            <SelectTrigger id="edit-age" className="w-full">
              <SelectValue placeholder="ไม่ระบุ" />
            </SelectTrigger>
            <SelectContent>
              {ageRangeOptions.map((a) => (
                <SelectItem key={a} value={a}>
                  {ageRangeLabels[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="edit-pre" label="คะแนนก่อน">
            <Input
              type="number"
              min={0}
              value={preScore}
              onChange={(e) => setPreScore(Number(e.target.value) || 0)}
            />
          </FormField>
          <FormField id="edit-pre-total" label="เต็มก่อน">
            <Input
              type="number"
              min={1}
              value={preTotal}
              onChange={(e) => setPreTotal(Number(e.target.value) || 1)}
            />
          </FormField>
          <FormField id="edit-post" label="คะแนนหลัง">
            <Input
              type="number"
              min={0}
              value={postScore}
              onChange={(e) => setPostScore(Number(e.target.value) || 0)}
              disabled={row.flow_type === "guest"}
            />
          </FormField>
          <FormField id="edit-post-total" label="เต็มหลัง">
            <Input
              type="number"
              min={0}
              value={postTotal}
              onChange={(e) => setPostTotal(Number(e.target.value) || 0)}
              disabled={row.flow_type === "guest"}
            />
          </FormField>
        </div>
      </div>

      <DialogFooter className="border-t-0 bg-transparent">
        <Button
          type="button"
          variant="outline"
          size="touch"
          onClick={() => onOpenChange(false)}
        >
          ยกเลิก
        </Button>
        <Button
          type="button"
          size="touch"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditResultDialog({
  row,
  open,
  onOpenChange,
  onSaved,
}: EditResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92dvh,40rem)] overflow-y-auto sm:max-w-lg">
        {row ? (
          <EditResultForm
            key={row.id}
            row={row}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
