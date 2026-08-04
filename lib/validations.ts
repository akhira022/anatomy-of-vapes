import { z } from "zod";

export const gradeOptions = [
  "มัธยมศึกษาตอนต้น",
  "มัธยมศึกษาตอนปลาย",
  "ปวช",
  "ปวส",
  "นักศึกษา",
  "อื่นๆ",
] as const;

export const registerSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(20, "ชื่อต้องไม่เกิน 20 ตัวอักษร"),
  grade: z.enum(gradeOptions, {
    errorMap: () => ({ message: "กรุณาเลือกระดับชั้น" }),
  }),
  consent: z.boolean().refine((v) => v === true, {
    message: "กรุณายอมรับเงื่อนไข PDPA",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
