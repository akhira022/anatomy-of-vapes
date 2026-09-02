import type { AppPhase } from "@/types";

export function phaseToPath(phase: AppPhase): string {
  switch (phase) {
    case "registration":
      return "/register";
    case "pretest":
      return "/pretest";
    case "anatomy":
      return "/anatomy";
    case "posttest":
      return "/posttest";
    case "result":
      return "/result";
    case "guest_complete":
      return "/guest/complete";
    default:
      return "/register";
  }
}

export function isLoggedIn(input: {
  nickname: string;
  consentAccepted: boolean;
}): boolean {
  return Boolean(input.nickname.trim() && input.consentAccepted);
}
