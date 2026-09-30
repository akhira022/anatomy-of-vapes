"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PracticeChatProps {
  situationTitle: string;
  progressLabel: string;
  friendLines: string[];
  friendReply: string | null;
  phrases: string[];
  selectedPhrase: string | null;
  onSelect: (phrase: string) => void;
  onTryAnother: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function PracticeChat({
  situationTitle,
  progressLabel,
  friendLines,
  friendReply,
  phrases,
  selectedPhrase,
  onSelect,
  onTryAnother,
  onNext,
  isLast,
}: PracticeChatProps) {
  return (
    <section
      aria-label="แชทจำลอง"
      className="flex min-h-[28rem] flex-col rounded-xl border border-border bg-card"
    >
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            สถานการณ์จำลอง
          </p>
          <h2 className="mt-1 font-heading text-base font-semibold text-textPrimary sm:text-lg">
            {situationTitle}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-textSecondary">
          {progressLabel}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-5">
        {friendLines.map((line) => (
          <div key={line} className="flex justify-start">
            <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-surface-2 px-3 py-2 text-sm leading-relaxed text-textPrimary">
              {line}
            </p>
          </div>
        ))}

        {selectedPhrase ? (
          <div className="flex justify-end">
            <p className="max-w-[90%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm leading-relaxed text-primary-foreground ring-2 ring-primary/40">
              <span className="mr-1.5 inline-flex size-4 align-middle">
                <Check className="size-4" aria-hidden="true" />
              </span>
              {selectedPhrase}
            </p>
          </div>
        ) : null}

        {friendReply && selectedPhrase ? (
          <div className="flex justify-start">
            <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-surface-2 px-3 py-2 text-sm leading-relaxed text-textPrimary">
              {friendReply}
            </p>
          </div>
        ) : null}

        {!selectedPhrase ? (
          <div className="mt-2 space-y-2" role="group" aria-label="เลือกคำปฏิเสธ">
            <p className="text-xs font-medium text-textSecondary">
              เลือกคำตอบที่อยากใช้
            </p>
            {phrases.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => onSelect(phrase)}
                className={cn(
                  "flex w-full items-start rounded-xl border border-border bg-background px-3 py-3 text-left text-sm text-textPrimary transition-colors",
                  "hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {phrase}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selectedPhrase ? (
        <footer className="flex flex-wrap gap-2 border-t border-border px-4 py-3 sm:px-5">
          <Button type="button" variant="outline" size="touch" onClick={onTryAnother}>
            ลองคำตอบอื่น
          </Button>
          <Button type="button" size="touch" onClick={onNext}>
            {isLast ? "จบการฝึก" : "ถัดไป"}
          </Button>
        </footer>
      ) : null}
    </section>
  );
}
