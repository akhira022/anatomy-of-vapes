"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";

interface FormFieldProps {
  id: string;
  label: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {hint ? (
        <p id={hintId} className="text-sm text-textSecondary">
          {hint}
        </p>
      ) : null}
      {React.cloneElement(children, {
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
