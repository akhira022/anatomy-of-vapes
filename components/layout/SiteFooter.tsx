import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { PartnerLogos } from "@/components/layout/PartnerLogos";

const exploreLinks = [
  { href: "/register", label: "เริ่มเรียนรู้" },
  { href: "/login", label: "เข้าสู่ระบบ" },
  { href: "/#how-it-works", label: "เรียนรู้ยังไง" },
  { href: "/#contact", label: "ติดต่อเรา" },
] as const;

const aboutLinks = [
  { href: "/#how-it-works", label: "เกี่ยวกับโครงการ" },
  { href: "/register", label: "ลงทะเบียนเรียน" },
  { href: "/admin/login", label: "สำหรับผู้ดูแล" },
] as const;

/** Draft placeholders — replace with confirmed partner contacts before launch. */
const contactDraft = {
  email: "contact@anatomyofvapes.example",
  phone: "02-000-0000",
  address: "กรุงเทพฯ (ที่อยู่รออัปเดต)",
  note: "ข้อมูลติดต่อเป็นร่างชั่วคราว — จะอัปเดตเมื่อได้รายละเอียดจากพันธมิตรโครงการ",
} as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 sm:py-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <p className="font-heading text-lg font-bold tracking-wide text-textPrimary">
            Anatomy of Vapes
          </p>
          <p className="mt-2 text-sm leading-relaxed text-textSecondary">
            ส่องไส้ในบุหรี่ไฟฟ้า — สำรวจส่วนประกอบและสารพิษผ่านโมเดล 3 มิติ
          </p>
          <p className="mt-6 text-xs font-medium tracking-wide text-textSecondary">
            สนับสนุนโดย
          </p>
          <PartnerLogos className="mt-3" density="footer" />
        </div>

        <nav aria-labelledby="footer-explore" className="md:col-span-2">
          <h2
            id="footer-explore"
            className="font-heading text-sm font-semibold text-textPrimary"
          >
            สำรวจ
          </h2>
          <ul className="mt-4 space-y-2.5">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-textSecondary transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-about" className="md:col-span-2">
          <h2
            id="footer-about"
            className="font-heading text-sm font-semibold text-textPrimary"
          >
            เกี่ยวกับ
          </h2>
          <ul className="mt-4 space-y-2.5">
            {aboutLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-textSecondary transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4" id="contact">
          <h2 className="font-heading text-sm font-semibold text-textPrimary">
            ติดต่อเรา
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-warning">
            {contactDraft.note}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-textSecondary">
            <li className="flex items-start gap-2.5">
              <Mail
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href={`mailto:${contactDraft.email}`}
                className="transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contactDraft.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href={`tel:${contactDraft.phone.replace(/-/g, "")}`}
                className="transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contactDraft.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{contactDraft.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-textDisabled">
            © {year} Anatomy of Vapes
          </p>
          <p className="text-xs text-textDisabled">
            โครงการสื่อการเรียนรู้เพื่อส่งเสริมสุขภาพเยาวชน
          </p>
        </div>
      </div>
    </footer>
  );
}
