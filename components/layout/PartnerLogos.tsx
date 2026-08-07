import Image from "next/image";
import { cn } from "@/lib/utils";

const PARTNER_LOGOS = [
  { src: "/images/logo_1.png", alt: "โลโก้พันธมิตร 1", width: 1183, height: 1182 },
  { src: "/images/logo_2.png", alt: "โลโก้พันธมิตร 2", width: 900, height: 900 },
  { src: "/images/logo_3.png", alt: "โลโก้พันธมิตร 3", width: 284, height: 285 },
  { src: "/images/logo_4.png", alt: "โลโก้พันธมิตร 4", width: 2481, height: 830 },
  { src: "/images/logo_5.png", alt: "โลโก้พันธมิตร 5", width: 842, height: 596 },
] as const;

interface PartnerLogosProps {
  className?: string;
  /** Compact row for footer; roomier wrap for landing section. */
  density?: "section" | "footer";
}

export function PartnerLogos({
  className,
  density = "section",
}: PartnerLogosProps) {
  const isFooter = density === "footer";

  return (
    <ul
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-5 sm:gap-x-8",
        isFooter && "justify-start gap-x-4 gap-y-3 sm:gap-x-5",
        className
      )}
      aria-label="โลโก้ผู้สนับสนุน"
    >
      {PARTNER_LOGOS.map((logo) => (
        <li
          key={logo.src}
          className={cn(
            "flex items-center justify-center",
            isFooter
              ? "h-9 w-[4.5rem] sm:h-10 sm:w-20"
              : "h-12 w-[5.5rem] sm:h-14 sm:w-28 md:h-16 md:w-32"
          )}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="h-full w-full object-contain opacity-90"
          />
        </li>
      ))}
    </ul>
  );
}
