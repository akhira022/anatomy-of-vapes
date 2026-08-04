"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export function useRequirePhase(required: AppPhase) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const visitedHotspots = useQuizStore((s) => s.visitedHotspots);
  const preAnswers = useQuizStore((s) => s.preAnswers);

  useEffect(() => {
    const registered = Boolean(nickname && consentAccepted);

    if (required !== "registration" && !registered) {
      router.replace("/register");
      return;
    }

    if (
      required === "anatomy" &&
      phaseIndex(currentPhase) < phaseIndex("anatomy") &&
      preAnswers.length < 5
    ) {
      router.replace("/pretest");
      return;
    }

    if (
      required === "posttest" &&
      visitedHotspots.length < hotspots.length &&
      phaseIndex(currentPhase) < phaseIndex("posttest")
    ) {
      router.replace("/anatomy");
      return;
    }

    if (
      required === "result" &&
      phaseIndex(currentPhase) < phaseIndex("result")
    ) {
      router.replace("/posttest");
      return;
    }

    setReady(true);
  }, [
    required,
    nickname,
    consentAccepted,
    currentPhase,
    visitedHotspots.length,
    preAnswers.length,
    router,
  ]);

  return ready;
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
