const SESSION_KEY = "aov-refusal-practice-session";
const CONSENT_KEY = "aov-refusal-practice-consent";

export function getPracticeSessionId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, id);
  return id;
}

export function hasPracticeConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CONSENT_KEY) === "1";
}

/** True after the visitor accepted or declined the practice PDPA prompt. */
export function hasPracticeConsentDecision(): boolean {
  if (typeof window === "undefined") return false;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "1" || value === "0";
}

export function setPracticeConsent(accepted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, accepted ? "1" : "0");
}
