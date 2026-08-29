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

export interface ChatUiMessage {
  id: string;
  role: ChatRole;
  content: string;
  citations?: ChatCitation[];
  hotspotId?: string;
  refused?: boolean;
  pending?: boolean;
  error?: boolean;
  mode?: "ai" | "rag";
}
