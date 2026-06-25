"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteUser } from "./actions";

export function DeleteUserButton({
  id,
  disabled,
}: {
  id: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending || disabled}
      onClick={() => {
        if (!confirm("Изтриване на този потребител?")) return;
        startTransition(() => deleteUser(id));
      }}
      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
      aria-label="Изтрий"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
