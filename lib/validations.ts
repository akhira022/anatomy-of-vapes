import { z } from "zod";

export const gradeOptions = [
  "มัธยมศึกษาตอนต้น",
  "มัธยมศึกษาตอนปลาย",
  "ปวช",
  "ปวส",
  "นักศึกษา",
  "อื่นๆ",
] as const;

const nicknameField = z
  .string()
  .trim()
  .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
  .max(20, "ชื่อต้องไม่เกิน 20 ตัวอักษร");

const gradeField = z.enum(gradeOptions, {
  errorMap: () => ({ message: "กรุณาเลือกระดับชั้น" }),
});

const consentField = z.boolean().refine((v) => v === true, {
  message: "กรุณายอมรับเงื่อนไข PDPA",
});

export const registerSchema = z
  .object({
    email: z.string().trim().email("อีเมลไม่ถูกต้อง"),
    password: z
      .string()
      .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
    nickname: nicknameField,
    grade: gradeField,
    consent: consentField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const learnerLoginSchema = z.object({
  email: z.string().trim().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export type LearnerLoginFormValues = z.infer<typeof learnerLoginSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
