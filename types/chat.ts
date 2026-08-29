export type ChatRole = "user" | "assistant";

export interface ChatHistoryMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCitation {
  id: string;
  title: string;
  org?: string;
  url?: string;
}

export interface ChatRequestBody {
  message: string;
  history?: ChatHistoryMessage[];
  sessionId?: string;
  /** When true, API returns NDJSON stream events instead of a single JSON body. */
  stream?: boolean;
}

export interface ChatResponseBody {
  answer: string;
  citations: ChatCitation[];
  hotspotId?: string;
  category: string;
  refused?: boolean;
  chunkIds?: string[];
  /** ai = Gemini สรุป, rag = ตอบจากฐานความรู้โดยตรง */
  mode?: "ai" | "rag";
}

export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | {
      type: "meta";
      citations: ChatCitation[];
      hotspotId?: string;
      category: string;
      mode: "ai" | "rag";
      refused?: boolean;
      chunkIds?: string[];
    }
  | { type: "done" }
  | { type: "error"; message: string };

export interface ChatUiMessage {
  id: string;
  role: ChatRole;
  content: string;
  citations?: ChatCitation[];
  hotspotId?: string;
  refused?: boolean;
  pending?: boolean;
  streaming?: boolean;
  error?: boolean;
  mode?: "ai" | "rag";
}
