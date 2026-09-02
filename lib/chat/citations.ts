import { getSourceById } from "@/lib/knowledge/build-chunks";
import type { ChatCitation } from "@/types/chat";
import type { RetrievedChunk } from "@/types/knowledge";

export function buildCitations(chunks: RetrievedChunk[]): ChatCitation[] {
  const seen = new Set<string>();
  const citations: ChatCitation[] = [];

  for (const chunk of chunks) {
    for (const sourceId of chunk.sourceIds) {
      if (!sourceId || seen.has(sourceId)) continue;
      seen.add(sourceId);

      const source = getSourceById(sourceId);
      if (!source) continue;

      citations.push({
        id: source.id,
        title: source.title,
        org: source.org,
        url: source.url,
      });
    }
  }

  return citations.slice(0, 4);
}
