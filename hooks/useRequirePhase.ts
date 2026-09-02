"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useQuizStore } from "@/store/useQuizStore";
import type { AppPhase, UserType } from "@/types";
import { hotspots } from "@/data/hotspots";

const phaseOrder: AppPhase[] = [
  "registration",
  "pretest",
  "anatomy",
  "posttest",
  "result",
  "guest_complete",
];

function phaseIndex(phase: AppPhase) {
  return phaseOrder.indexOf(phase);
}

export type PhaseBlockReason =
  | "hydrating"
  | "not_registered"
  | "pretest_incomplete"
  | "anatomy_incomplete"
  | "posttest_incomplete";

const blockMessages: Record<PhaseBlockReason, string> = {
  hydrating: "กำลังเตรียมข้อมูล…",
  not_registered: "กรุณาลงทะเบียนและยอมรับ PDPA ก่อนเริ่มเรียน",
  pretest_incomplete: "กรุณาทำแบบทดสอบก่อนเรียนให้ครบก่อน",
  anatomy_incomplete: "กรุณาสำรวจจุดสารพิษให้ครบทุกจุดก่อน",
  posttest_incomplete: "กรุณาทำแบบทดสอบหลังเรียนให้ครบก่อน",
};

export function getPhaseBlockMessage(reason: PhaseBlockReason | null) {
  return reason ? blockMessages[reason] : null;
}

function evaluatePhaseAccess(
  required: AppPhase,
  hydrated: boolean,
  nickname: string,
  consentAccepted: boolean,
  currentPhase: AppPhase,
  visitedHotspotCount: number,
  preAnswerCount: number,
  resultSaved: boolean,
  userType: UserType
): {
  ready: boolean;
  blockedReason: PhaseBlockReason | null;
  redirectTo: string | null;
} {
  if (!hydrated) {
    return { ready: false, blockedReason: "hydrating", redirectTo: null };
  }

  const registered = Boolean(nickname && consentAccepted);
  const isGuest = userType === "guest";
  const registerPath = isGuest ? "/guest" : "/register";

  if (required !== "registration" && !registered) {
    return {
      ready: false,
      blockedReason: "not_registered",
      redirectTo: registerPath,
    };
  }

  if (required === "anatomy" && (currentPhase === "result" || resultSaved)) {
    return { ready: true, blockedReason: null, redirectTo: null };
  }

  if (
    required === "anatomy" &&
    currentPhase === "guest_complete"
  ) {
    return { ready: true, blockedReason: null, redirectTo: null };
  }

  if (
    required === "anatomy" &&
    phaseIndex(currentPhase) < phaseIndex("anatomy") &&
    preAnswerCount < 5
  ) {
    return {
      ready: false,
      blockedReason: "pretest_incomplete",
      redirectTo: "/pretest",
    };
  }

  if (
    required === "posttest" &&
    isGuest
  ) {
    return {
      ready: false,
      blockedReason: "anatomy_incomplete",
      redirectTo: "/anatomy",
    };
  }

  if (
    required === "posttest" &&
    visitedHotspotCount < hotspots.length &&
    phaseIndex(currentPhase) < phaseIndex("posttest")
  ) {
    return {
      ready: false,
      blockedReason: "anatomy_incomplete",
      redirectTo: "/anatomy",
    };
  }

  if (required === "guest_complete") {
    if (!isGuest) {
      return {
        ready: false,
        blockedReason: "not_registered",
        redirectTo: "/register",
      };
    }
    if (
      visitedHotspotCount < hotspots.length &&
      currentPhase !== "guest_complete" &&
      !resultSaved
    ) {
      return {
        ready: false,
        blockedReason: "anatomy_incomplete",
        redirectTo: "/anatomy",
      };
    }
    return { ready: true, blockedReason: null, redirectTo: null };
  }

  if (
    required === "result" &&
    phaseIndex(currentPhase) < phaseIndex("result")
  ) {
    if (isGuest) {
      return {
        ready: false,
        blockedReason: "anatomy_incomplete",
        redirectTo: "/anatomy",
      };
    }
    return {
      ready: false,
      blockedReason: "posttest_incomplete",
      redirectTo: "/posttest",
    };
  }

  return { ready: true, blockedReason: null, redirectTo: null };
}

export function useRequirePhase(required: AppPhase) {
  const router = useAppRouter();
  const hydrated = useHydrated();
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const visitedHotspots = useQuizStore((s) => s.visitedHotspots);
  const preAnswers = useQuizStore((s) => s.preAnswers);
  const resultSaved = useQuizStore((s) => s.resultSaved);
  const userType = useQuizStore((s) => s.userType);

  const { ready, blockedReason, redirectTo } = useMemo(
    () =>
      evaluatePhaseAccess(
        required,
        hydrated,
        nickname,
        consentAccepted,
        currentPhase,
        visitedHotspots.length,
        preAnswers.length,
        resultSaved,
        userType
      ),
    [
      required,
      hydrated,
      nickname,
      consentAccepted,
      currentPhase,
      visitedHotspots.length,
      preAnswers.length,
      resultSaved,
      userType,
    ]
  );

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  return { ready, blockedReason };
}

/** @deprecated Use destructured `{ ready }` from useRequirePhase */
export function useRequirePhaseReady(required: AppPhase) {
  return useRequirePhase(required).ready;
}

export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
