"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AgeRange,
  AppPhase,
  Grade,
  QuizAnswer,
  QuizQuestion,
  UserType,
} from "@/types";

interface QuizState {
  userId: string | null;
  nickname: string;
  email: string;
  grade: Grade | null;
  ageRange: AgeRange | null;
  userType: UserType;
  consentAccepted: boolean;
  preScore: number;
  postScore: number;
  preAnswers: QuizAnswer[];
  postAnswers: QuizAnswer[];
  currentPhase: AppPhase;
  currentChapter: number;
  currentQuestionIndex: number;
  pretestQuestions: QuizQuestion[];
  posttestQuestions: QuizQuestion[];
  visitedHotspots: string[];
  resultSaved: boolean;
  selectedHotspotId: string | null;

  setUser: (
    nickname: string,
    grade: Grade,
    userId?: string,
    email?: string,
    ageRange?: AgeRange,
    userType?: UserType
  ) => void;
  setConsentAccepted: (accepted: boolean) => void;
  setUserId: (userId: string) => void;
  setPhase: (phase: AppPhase) => void;
  setChapter: (chapter: number) => void;
  setQuestionIndex: (index: number) => void;
  setPretestQuestions: (questions: QuizQuestion[]) => void;
  setPosttestQuestions: (questions: QuizQuestion[]) => void;
  submitAnswer: (
    questionId: string,
    selectedOptionId: string,
    isCorrect: boolean,
    type: "pretest" | "posttest"
  ) => void;
  calculatePreScore: () => void;
  calculatePostScore: () => void;
  markHotspotVisited: (hotspotId: string) => void;
  setSelectedHotspotId: (id: string | null) => void;
  setResultSaved: (saved: boolean) => void;
  /** Clear quiz progress but keep the same learner identity */
  resetProgress: () => void;
  /** Full logout — clear identity and progress */
  logout: () => void;
  resetQuiz: () => void;
}

const initialState = {
  userId: null as string | null,
  nickname: "",
  email: "",
  grade: null as Grade | null,
  ageRange: null as AgeRange | null,
  userType: "member" as UserType,
  consentAccepted: false,
  preScore: 0,
  postScore: 0,
  preAnswers: [] as QuizAnswer[],
  postAnswers: [] as QuizAnswer[],
  currentPhase: "registration" as AppPhase,
  currentChapter: 1,
  currentQuestionIndex: 0,
  pretestQuestions: [] as QuizQuestion[],
  posttestQuestions: [] as QuizQuestion[],
  visitedHotspots: [] as string[],
  resultSaved: false,
  selectedHotspotId: null as string | null,
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (nickname, grade, userId, email, ageRange, userType) =>
        set({
          nickname,
          grade,
          ...(email !== undefined ? { email } : {}),
          ...(userId ? { userId } : {}),
          ...(ageRange !== undefined ? { ageRange } : {}),
          ...(userType !== undefined ? { userType } : {}),
        }),

      setConsentAccepted: (accepted) => set({ consentAccepted: accepted }),

      setUserId: (userId) => set({ userId }),

      setPhase: (phase) => set({ currentPhase: phase }),

      setChapter: (chapter) =>
        set({ currentChapter: chapter, currentQuestionIndex: 0 }),

      setQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      setPretestQuestions: (questions) =>
        set({ pretestQuestions: questions }),

      setPosttestQuestions: (questions) =>
        set({ posttestQuestions: questions }),

      submitAnswer: (questionId, selectedOptionId, isCorrect, type) => {
        const answer: QuizAnswer = {
          questionId,
          selectedOptionId,
          isCorrect,
        };

        if (type === "pretest") {
          set((state) => ({
            preAnswers: [
              ...state.preAnswers.filter((a) => a.questionId !== questionId),
              answer,
            ],
          }));
          get().calculatePreScore();
        } else {
          set((state) => ({
            postAnswers: [
              ...state.postAnswers.filter((a) => a.questionId !== questionId),
              answer,
            ],
          }));
          get().calculatePostScore();
        }
      },

      calculatePreScore: () => {
        const { preAnswers } = get();
        set({ preScore: preAnswers.filter((a) => a.isCorrect).length });
      },

      calculatePostScore: () => {
        const { postAnswers } = get();
        set({ postScore: postAnswers.filter((a) => a.isCorrect).length });
      },

      markHotspotVisited: (hotspotId) =>
        set((state) => ({
          visitedHotspots: state.visitedHotspots.includes(hotspotId)
            ? state.visitedHotspots
            : [...state.visitedHotspots, hotspotId],
        })),

      setSelectedHotspotId: (id) => set({ selectedHotspotId: id }),

      setResultSaved: (saved) => set({ resultSaved: saved }),

      resetProgress: () => {
        const {
          userId,
          nickname,
          email,
          grade,
          ageRange,
          userType,
          consentAccepted,
          resultSaved,
        } = get();
        set({
          ...initialState,
          userId,
          nickname,
          email,
          grade,
          ageRange,
          userType,
          consentAccepted,
          resultSaved,
          currentPhase: "pretest",
        });
      },

      logout: () => set(initialState),

      resetQuiz: () => set(initialState),
    }),
    {
      name: "anatomy-of-vapes-quiz",
      partialize: (state) => ({
        userId: state.userId,
        nickname: state.nickname,
        email: state.email,
        grade: state.grade,
        ageRange: state.ageRange,
        userType: state.userType,
        consentAccepted: state.consentAccepted,
        preScore: state.preScore,
        postScore: state.postScore,
        preAnswers: state.preAnswers,
        postAnswers: state.postAnswers,
        currentPhase: state.currentPhase,
        currentChapter: state.currentChapter,
        visitedHotspots: state.visitedHotspots,
        resultSaved: state.resultSaved,
      }),
    }
  )
);
