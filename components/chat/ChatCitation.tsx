import type { ChatCitation } from "@/types/chat";
import { ExternalLink } from "lucide-react";

interface ChatCitationListProps {
  citations: ChatCitation[];
}

export function ChatCitationList({ citations }: ChatCitationListProps) {
  if (!citations.length) return null;

  return (
    <div className="mt-2 space-y-1 border-t border-border/60 pt-2">
      <p className="text-[0.7rem] font-medium text-muted-foreground">
        แหล่งอ้างอิง
      </p>
      <ul className="space-y-1">
        {citations.map((citation) => (
          <li key={citation.id} className="text-[0.7rem] leading-snug">
            {citation.url ? (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 text-info hover:underline"
              >
                <span>
                  {citation.org ? `${citation.org} — ` : ""}
                  {citation.title}
                </span>
                <ExternalLink className="mt-0.5 size-3 shrink-0" />
              </a>
            ) : (
              <span className="text-muted-foreground">{citation.title}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
