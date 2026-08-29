import { cn } from "@/lib/utils";

interface FieldErrorProps {
  id?: string;
  message?: string;
  className?: string;
}

export function FieldError({ id, message, className }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-sm text-error", className)}
    >
      {message}
    </p>
  );
}
