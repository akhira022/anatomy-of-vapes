"use client";

import { quickPrompts } from "@/data/faq";
import { Button } from "@/components/ui/button";

interface ChatQuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  /** ซ่อนคำถามที่ถามไปแล้วในรอบนี้ */
  exclude?: string[];
  label?: string;
}

export function ChatQuickPrompts({
  onSelect,
  disabled,
  exclude = [],
  label,
}: ChatQuickPromptsProps) {
  const excluded = new Set(exclude.map((item) => item.trim()));
  const prompts = quickPrompts.filter((prompt) => !excluded.has(prompt));

  if (prompts.length === 0) return null;

  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt) => (
        <Button
          key={prompt}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-auto min-h-11 max-w-full whitespace-normal px-3 py-2 text-left text-xs leading-snug"
          onClick={() => onSelect(prompt)}
        >
          {prompt}
        </Button>
      ))}
      </div>
    </div>
  );
}
