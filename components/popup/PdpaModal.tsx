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

/**
 * นโยบายตามข้อมูลที่แอปเก็บจริง (ชื่อเล่น ระดับชั้น คะแนน/คำตอบ ความยินยอม)
 * หน่วยงานพันธมิตรควรตรวจยืนยันก่อนใช้ใน production อย่างเป็นทางการ
 */
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
            โครงการ Anatomy of Vapes (ส่องไส้ในบุหรี่ไฟฟ้า) —
            การเก็บและใช้ข้อมูลเพื่อการเรียนรู้และประเมินผล
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-textSecondary">
          <p>
            <span className="font-medium text-textPrimary">ผู้ควบคุมข้อมูล:</span>{" "}
            โครงการ Anatomy of Vapes ซึ่งเป็นสื่อการเรียนรู้เพื่อส่งเสริมสุขภาพเยาวชน
            ภายใต้การสนับสนุนของหน่วยงานด้านสุขภาพและสื่อสร้างสรรค์
          </p>
          <p>
            <span className="font-medium text-textPrimary">ข้อมูลที่เก็บ:</span>{" "}
            ชื่อเล่น ระดับการศึกษา ความยินยอมตามนโยบายนี้
            รวมถึงคะแนนและคำตอบของแบบทดสอบก่อนเรียนและหลังเรียน
            เราไม่เก็บชื่อ-นามสกุลจริง หมายเลขโทรศัพท์ ที่อยู่ อีเมลส่วนตัว
            หรือเอกสารยืนยันตัวตน
          </p>
          <p>
            <span className="font-medium text-textPrimary">วัตถุประสงค์:</span>{" "}
            เพื่อให้คุณเข้าถึงกิจกรรมการเรียนรู้ วัดผลการเรียนรู้
            และให้ผู้ดูแลระบบดูสถิติรวมและส่งออกข้อมูลเพื่อประเมินผลทางการศึกษา
            ไม่ใช้ข้อมูลเพื่อการโฆษณาหรือการตลาดเชิงพาณิชย์
          </p>
          <p>
            <span className="font-medium text-textPrimary">การเปิดเผย:</span>{" "}
            ข้อมูลอาจถูกประมวลผลผ่านระบบจัดเก็บของโครงการเพื่อวัตถุประสงค์ข้างต้น
            และอาจเปิดเผยในรูปแบบสรุปรวมที่ไม่ระบุตัวบุคคลต่อผู้จัดกิจกรรมหรือผู้ประเมินผล
            โดยไม่เปิดเผยต่อบุคคลภายนอกโดยไม่จำเป็น
          </p>
          <p>
            <span className="font-medium text-textPrimary">ระยะเวลาเก็บรักษา:</span>{" "}
            เก็บเท่าที่จำเป็นต่อการเรียนรู้และการประเมินผลของโครงการ
            หรือจนกว่าคุณจะขอถอนความยินยอมผ่านช่องทางด้านล่าง
          </p>
          <p>
            <span className="font-medium text-textPrimary">สิทธิ์ของคุณ:</span>{" "}
            คุณมีสิทธิ์เข้าถึง ขอแก้ไข หรือถอนความยินยอมเกี่ยวกับข้อมูลที่เกี่ยวข้องกับชื่อเล่นของคุณ
            ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>
          <p>
            <span className="font-medium text-textPrimary">การติดต่อใช้สิทธิ์:</span>{" "}
            แจ้งครู ผู้ดำเนินกิจกรรม หรือผู้ดูแลที่จัดเซสชันการเรียนรู้ครั้งนี้
            (เช่น ผ่าน QR หรือกิจกรรมในห้องเรียน) เพื่อดำเนินการตามคำขอของคุณ
          </p>
          <p>
            การกดยอมรับหมายความว่าคุณได้อ่านและยินยอมให้เก็บและประมวลผลข้อมูลตามที่ระบุ
            เพื่อวัตถุประสงค์ทางการศึกษาของโครงการ
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
