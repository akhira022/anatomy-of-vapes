import { FacebookMark } from "@/components/promo/FacebookMark";
import { FACEBOOK_PAGE_URL } from "@/lib/social";
import { cn } from "@/lib/utils";

interface FacebookPageLinkProps {
  className?: string;
  label?: string;
}

export function FacebookPageLink({
  className,
  label = "เพจ Facebook",
}: FacebookPageLinkProps) {
  return (
    <a
      href={FACEBOOK_PAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-sm font-medium text-textSecondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <FacebookMark className="size-4" />
      {label}
    </a>
  );
}
