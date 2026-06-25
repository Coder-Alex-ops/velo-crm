"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteBicycle } from "./actions";

export function DeleteBicycleButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            "Изтриване ще премахне и всички сервизни записи за този велосипед. Продължаване?",
          )
        )
          return;
        startTransition(async () => {
          await deleteBicycle(id);
          router.push("/bicycles");
        });
      }}
      className="btn-danger"
    >
      <Trash2 className="h-4 w-4" />
      Изтрий
    </button>
  );
}

export function DeleteBicycleRowButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Изтриване на този велосипед?")) return;
        startTransition(() => deleteBicycle(id));
      }}
      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Изтрий"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
