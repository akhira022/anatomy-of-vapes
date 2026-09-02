"use client";

import { useAppRouter } from "@/hooks/useAppRouter";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuizStore } from "@/store/useQuizStore";
import { signOutLearner } from "@/lib/learner-auth";
import { isLoggedIn } from "@/lib/phase";

export function UserSessionMenu({
  showNicknameOnMobile = false,
}: {
  showNicknameOnMobile?: boolean;
}) {
  const router = useAppRouter();
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const logout = useQuizStore((s) => s.logout);

  if (!isLoggedIn({ nickname, consentAccepted })) {
    return null;
  }

  const handleLogout = () => {
    void signOutLearner();
    logout();
    toast.success("ออกจากระบบแล้ว");
    router.replace("/");
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "max-w-[5.5rem] truncate text-xs text-textSecondary sm:max-w-[8rem] sm:text-sm",
          !showNicknameOnMobile && "hidden sm:inline"
        )}
      >
        {nickname}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="ออกจากระบบ"
        className="size-10 rounded-lg text-textPrimary"
        onClick={handleLogout}
      >
        <LogOut className="size-5" />
      </Button>
    </div>
  );
}
