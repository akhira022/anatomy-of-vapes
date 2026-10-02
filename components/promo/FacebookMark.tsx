import { cn } from "@/lib/utils";

export function FacebookMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-4 fill-current", className)}
    >
      <path d="M14.5 8.2h3.1V4.6H14.3c-2.9 0-4.8 1.8-4.8 4.6V11H7v3.6h2.5V22h3.8v-7.4h3.2L17 11h-3.7V9.3c0-.8.4-1.1 1.2-1.1Z" />
    </svg>
  );
}
