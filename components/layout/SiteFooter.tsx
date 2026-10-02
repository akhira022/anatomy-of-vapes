import Link from "next/link";
import { PartnerLogos } from "@/components/layout/PartnerLogos";
import { FacebookPageLink } from "@/components/promo/FacebookPageLink";

const exploreLinks = [
  { href: "/register", label: "เริ่มเรียนรู้" },
  { href: "/practice", label: "ฝึกปฏิเสธเพื่อน" },
  { href: "/impact", label: "ผลต่อร่างกาย" },
  { href: "/login", label: "เข้าสู่ระบบ" },
  { href: "/#how-it-works", label: "เรียนรู้ยังไง" },
] as const;

const aboutLinks = [
  { href: "/#how-it-works", label: "เกี่ยวกับโครงการ" },
  { href: "/register", label: "ลงทะเบียนเรียน" },
  { href: "/admin/login", label: "สำหรับผู้ดูแล" },
] as const;

const partnerNames = [
  { name: "คิดดี iDOL", href: "https://www.kiddeeidol.com/" },
  { name: "ยกกำลังสุข · Sook Enterprise", href: "https://thaicare.org/" },
  {
    name: "ศูนย์สร้างสรรค์สื่อเพื่อเด็กเยาวชนและครอบครัว",
    href: "https://thaicare.org/",
  },
  {
    name: "สสส. สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ",
    href: "https://www.thaihealth.or.th/",
  },
  {
    name: "สำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.)",
    href: "https://www.vec.go.th/",
  },
  { name: "วิทยาลัยเทคนิคพัทลุง", href: "https://ptl.ac.th/web/" },
] as const;

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
          <FacebookPageLink className="mt-4" />
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

        <div className="md:col-span-4">
          <h2 className="font-heading text-sm font-semibold text-textPrimary">
            สนับสนุนโดย
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-textSecondary">
            {partnerNames.map((partner) => (
              <li key={partner.name}>
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {partner.name}
                </a>
              </li>
            ))}
          </ul>
          <PartnerLogos className="mt-4" density="footer" />
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
        <p className="mx-auto mt-3 max-w-5xl text-center text-[10px] leading-relaxed text-textDisabled/60">
          พัฒนาโดย นักศึกษาวิทยาลัยเทคนิคพัทลุง สาขาเทคโนโลยีสารสนเทศ
        </p>
      </div>
    </footer>
  );
}
