"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCustomer } from "./actions";

export function DeleteCustomerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            "Изтриване на клиента ще премахне и неговите велосипеди и сервизни записи. Сигурни ли сте?",
          )
        )
          return;
        startTransition(async () => {
          await deleteCustomer(id);
          router.push("/customers");
        });
      }}
      className="btn-danger"
    >
      <Trash2 className="h-4 w-4" />
      Изтрий
    </button>
  );
}

export function DeleteCustomerRowButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Изтриване на този клиент?")) return;
        startTransition(() => deleteCustomer(id));
      }}
      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Изтрий"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
