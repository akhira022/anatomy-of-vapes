import type { AppPhase, UserType } from "@/types";

export function phaseToPath(
  phase: AppPhase,
  userType: UserType = "member"
): string {
  switch (phase) {
    case "registration":
      return userType === "guest" ? "/guest" : "/register";
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
      return userType === "guest" ? "/guest" : "/register";
  }
}

export function isLoggedIn(input: {
  nickname: string;
  consentAccepted: boolean;
}): boolean {
  return Boolean(input.nickname.trim() && input.consentAccepted);
}
