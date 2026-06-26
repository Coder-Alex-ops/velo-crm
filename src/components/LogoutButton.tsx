"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logoutAction } from "@/app/login/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAction())}
      className="rounded-md p-1.5 text-zinc-500 hover:bg-surface-800 hover:text-zinc-300 disabled:opacity-50"
      aria-label="Изход"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
