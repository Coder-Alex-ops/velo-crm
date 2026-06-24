"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteServiceRecord } from "./actions";

export function DeleteServiceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Изтриване на този сервизен запис?")) return;
        startTransition(async () => {
          await deleteServiceRecord(id);
          router.push("/services");
        });
      }}
      className="btn-danger"
    >
      <Trash2 className="h-4 w-4" />
      Изтрий
    </button>
  );
}

export function DeleteServiceRowButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Изтриване на този запис?")) return;
        startTransition(() => deleteServiceRecord(id));
      }}
      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Изтрий"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
