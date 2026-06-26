"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Изтриване на продукта? Действието е необратимо.")) return;
        startTransition(() => deleteProduct(id));
      }}
      className="btn-danger"
    >
      <Trash2 className="h-4 w-4" />
      Изтрий
    </button>
  );
}

export function DeleteProductRowButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Изтриване на продукта?")) return;
        startTransition(() => deleteProduct(id));
      }}
      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Изтрий"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
