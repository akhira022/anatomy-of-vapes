import { z } from "zod";

export const gradeOptions = [
  "มัธยมศึกษาตอนต้น",
  "มัธยมศึกษาตอนปลาย",
  "ปวช",
  "ปวส",
  "นักศึกษา",
  "อื่นๆ",
] as const;

export const ageRangeOptions = ["13-15", "16-18", "19-24", "25+"] as const;

export const ageRangeLabels: Record<(typeof ageRangeOptions)[number], string> =
  {
    "13-15": "13–15 ปี",
    "16-18": "16–18 ปี",
    "19-24": "19–24 ปี",
    "25+": "25 ปีขึ้นไป",
  };

const nicknameField = z
  .string()
  .trim()
  .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
  .max(20, "ชื่อต้องไม่เกิน 20 ตัวอักษร");

const gradeField = z.enum(gradeOptions, {
  errorMap: () => ({ message: "กรุณาเลือกระดับชั้น" }),
});

const ageRangeField = z.enum(ageRangeOptions, {
  errorMap: () => ({ message: "กรุณาเลือกช่วงอายุ" }),
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
    ageRange: ageRangeField,
    consent: consentField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const guestSchema = z.object({
  nickname: nicknameField,
  grade: gradeField,
  ageRange: ageRangeField,
  consent: consentField,
});

export type GuestFormValues = z.infer<typeof guestSchema>;

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
