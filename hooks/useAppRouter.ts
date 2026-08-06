"use client";

import { useMemo } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { startRouteProgress } from "@/lib/navigation";

type NextRouter = ReturnType<typeof useNextRouter>;

export function useAppRouter(): NextRouter {
  const router = useNextRouter();

  return useMemo(
    () => ({
      ...router,
      push: (...args: Parameters<NextRouter["push"]>) => {
        startRouteProgress();
        return router.push(...args);
      },
      replace: (...args: Parameters<NextRouter["replace"]>) => {
        startRouteProgress();
        return router.replace(...args);
      },
    }),
    [router]
  );
}
