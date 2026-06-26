"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ServiceCatalogItem } from "@/lib/types";
import { formatEur } from "@/lib/crm";
import {
  createCatalogItem,
  deleteCatalogItem,
  updateCatalogItem,
} from "./actions";

function moneyToString(n: number): string {
  return n === 0 ? "" : String(n);
}

export function CatalogList({ items }: { items: ServiceCatalogItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editActive, setEditActive] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  function startEdit(item: ServiceCatalogItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(moneyToString(item.defaultPrice));
    setEditActive(item.isActive);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(item: ServiceCatalogItem) {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("name", editName);
      fd.append("defaultPrice", editPrice || "0");
      fd.append("isActive", String(editActive));
      fd.append("sortOrder", String(item.sortOrder));
      await updateCatalogItem(item.id, fd);
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Изтриете ли тази услуга от ценоразписа?")) return;
    startTransition(async () => {
      await deleteCatalogItem(id);
      router.refresh();
    });
  }

  function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("name", newName.trim());
      fd.append("defaultPrice", newPrice || "0");
      fd.append("sortOrder", String(items.length));
      await createCatalogItem(fd);
      setNewName("");
      setNewPrice("");
      setShowAdd(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold text-zinc-900">
            Услуги ({items.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            disabled={showAdd}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Добави
          </button>
        </div>

        <div className="divide-y divide-zinc-100">
          {/* Add new row */}
          {showAdd && (
            <div className="flex items-center gap-2 bg-brand-50 px-4 py-3 sm:px-6">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setShowAdd(false);
                    setNewName("");
                    setNewPrice("");
                  }
                }}
                placeholder="Название на услугата"
                className="input min-w-0 flex-1 py-1.5 text-sm"
                autoFocus
              />
              <div className="relative w-32 shrink-0">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-gray-400">
                  €
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                  placeholder="0.00"
                  className="money-input py-1.5 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isPending || !newName.trim()}
                className="btn-primary shrink-0 px-2.5 py-1.5 text-xs"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setNewName("");
                  setNewPrice("");
                }}
                className="shrink-0 rounded p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {items.length === 0 && !showAdd && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">
              Няма добавени услуги. Натиснете „Добави" за да започнете.
            </p>
          )}

          {items.map((item) =>
            editingId === item.id ? (
              <div
                key={item.id}
                className="flex items-center gap-2 px-4 py-3 sm:px-6"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(item);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="input min-w-0 flex-1 py-1.5 text-sm"
                  autoFocus
                />
                <div className="relative w-32 shrink-0">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-gray-400">
                    €
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item); }}
                    placeholder="0.00"
                    className="money-input py-1.5 text-sm"
                  />
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 accent-amber-500"
                  />
                  Активна
                </label>
                <button
                  type="button"
                  onClick={() => saveEdit(item)}
                  disabled={isPending}
                  className="btn-primary shrink-0 px-2.5 py-1.5 text-xs"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="shrink-0 rounded p-1.5 text-zinc-400 hover:bg-zinc-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-sm font-medium ${item.isActive ? "text-zinc-900" : "text-zinc-400 line-through"}`}
                  >
                    {item.name}
                  </span>
                  {!item.isActive && (
                    <span className="ml-2 text-xs text-zinc-400">
                      (неактивна)
                    </span>
                  )}
                </div>
                <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-zinc-700">
                  {formatEur(item.defaultPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="shrink-0 rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="shrink-0 rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <p className="text-xs leading-relaxed text-zinc-400">
          Активните услуги се появяват в падащото меню при създаване на
          поръчка. При нужда цените се редактират за всяка поръчка поотделно.
        </p>
      </div>
    </div>
  );
}
