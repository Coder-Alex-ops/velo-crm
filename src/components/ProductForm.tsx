"use client";

import { SubmitButton } from "@/components/SubmitButton";
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "chain", label: "Верига" },
  { value: "cassette", label: "Касета" },
  { value: "tire", label: "Гума" },
  { value: "brake", label: "Спирачка" },
  { value: "cable", label: "Кабел" },
  { value: "accessory", label: "Аксесоар" },
  { value: "other", label: "Друго" },
];

export function ProductForm({
  product,
  action,
  submitLabel,
  showInitialQuantity = false,
}: {
  product?: Product;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  showInitialQuantity?: boolean;
}) {
  return (
    <form action={action} className="card p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label className="label">
            Наименование <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className="input"
            placeholder="напр. Верига KMC X11"
          />
        </div>

        <div>
          <label className="label">SKU (код)</label>
          <input
            name="sku"
            defaultValue={product?.sku ?? ""}
            className="input"
            placeholder="напр. KMC-X11-116"
          />
          <p className="mt-1 text-xs text-gray-500">
            Съвпада с SKU в Square POS
          </p>
        </div>

        <div>
          <label className="label">Категория</label>
          <select
            name="category"
            defaultValue={product?.category ?? ""}
            className="input"
          >
            <option value="">— Изберете —</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Единична цена (€)</label>
          <input
            name="unitPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.unitPrice ?? 0}
            className="input"
          />
        </div>

        <div>
          <label className="label">Минимална наличност</label>
          <input
            name="lowStockThreshold"
            type="number"
            min="0"
            defaultValue={product?.lowStockThreshold ?? 5}
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500">
            Предупреждение при достигане
          </p>
        </div>

        {showInitialQuantity && (
          <div>
            <label className="label">Начална наличност</label>
            <input
              name="quantity"
              type="number"
              min="0"
              defaultValue={0}
              className="input"
            />
          </div>
        )}

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label">Описание</label>
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            rows={2}
            className="input"
            placeholder="Допълнителна информация за продукта..."
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
