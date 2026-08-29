"use client";

import { useEffect, useState } from "react";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useQuizStore } from "@/store/useQuizStore";
import type { AppPhase } from "@/types";
import { hotspots } from "@/data/hotspots";

const phaseOrder: AppPhase[] = [
  "registration",
  "pretest",
  "anatomy",
  "posttest",
  "result",
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

export function useRequirePhase(required: AppPhase) {
  const router = useAppRouter();
  const [ready, setReady] = useState(false);
  const [blockedReason, setBlockedReason] = useState<PhaseBlockReason | null>(
    "hydrating"
  );
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const visitedHotspots = useQuizStore((s) => s.visitedHotspots);
  const preAnswers = useQuizStore((s) => s.preAnswers);
  const resultSaved = useQuizStore((s) => s.resultSaved);

  useEffect(() => {
    const registered = Boolean(nickname && consentAccepted);

    if (required !== "registration" && !registered) {
      setReady(false);
      setBlockedReason("not_registered");
      router.replace("/register");
      return;
    }

    if (
      required === "anatomy" &&
      (currentPhase === "result" || resultSaved)
    ) {
      setBlockedReason(null);
      setReady(true);
      return;
    }

    if (
      required === "anatomy" &&
      phaseIndex(currentPhase) < phaseIndex("anatomy") &&
      preAnswers.length < 5
    ) {
      setReady(false);
      setBlockedReason("pretest_incomplete");
      router.replace("/pretest");
      return;
    }

    if (
      required === "posttest" &&
      visitedHotspots.length < hotspots.length &&
      phaseIndex(currentPhase) < phaseIndex("posttest")
    ) {
      setReady(false);
      setBlockedReason("anatomy_incomplete");
      router.replace("/anatomy");
      return;
    }

    if (
      required === "result" &&
      phaseIndex(currentPhase) < phaseIndex("result")
    ) {
      setReady(false);
      setBlockedReason("posttest_incomplete");
      router.replace("/posttest");
      return;
    }

    setBlockedReason(null);
    setReady(true);
  }, [
    required,
    nickname,
    consentAccepted,
    currentPhase,
    visitedHotspots.length,
    preAnswers.length,
    resultSaved,
    router,
  ]);

  return { ready, blockedReason };
}

/** @deprecated Use destructured `{ ready }` from useRequirePhase */
export function useRequirePhaseReady(required: AppPhase) {
  return useRequirePhase(required).ready;
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
