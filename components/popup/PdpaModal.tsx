"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PdpaModal() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm text-primary"
          />
        }
      >
        นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>นโยบายความเป็นส่วนตัว</DialogTitle>
          <DialogDescription>
            ข้อความตัวอย่างสำหรับ MVP — แทนที่ด้วยนโยบายจริงของโครงการ
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-textSecondary">
          <p>
            โครงการ Anatomy of Vapes เก็บเฉพาะชื่อเล่น ระดับชั้น
            และคะแนนแบบทดสอบ เพื่อใช้ในการศึกษาและประเมินผลการเรียนรู้
          </p>
          <p>
            เราไม่เก็บข้อมูลที่ระบุตัวตนได้โดยตรง เช่น ชื่อ-นามสกุลจริง เบอร์โทร
            หรือที่อยู่ และจะไม่เปิดเผยข้อมูลส่วนบุคคลต่อบุคคลที่สามโดยไม่จำเป็น
          </p>
          <p>
            การกดยอมรับหมายความว่าคุณยินยอมให้เก็บและประมวลผลข้อมูลดังกล่าว
            เพื่อวัตถุประสงค์ทางการศึกษาตามที่ระบุ
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
