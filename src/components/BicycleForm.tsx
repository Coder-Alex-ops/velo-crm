"use client";

import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import type { Bicycle, Customer } from "@/lib/types";
import { BIKE_TYPES, customerFullName } from "@/lib/crm";

export function BicycleForm({
  bicycle,
  customers,
  defaultCustomerId,
  action,
  submitLabel,
}: {
  bicycle?: Bicycle;
  customers: Customer[];
  defaultCustomerId?: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const sortedCustomers = [...customers].sort((a, b) =>
    customerFullName(a).localeCompare(customerFullName(b)),
  );

  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="card p-4 sm:p-6">
          <label className="label">Клиент</label>
          {sortedCustomers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500">
              Няма добавени клиенти.{" "}
              <Link
                href="/customers/new"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Добави клиент
              </Link>
              .
            </div>
          ) : (
            <select
              name="customerId"
              defaultValue={bicycle?.customerId ?? defaultCustomerId ?? ""}
              required
              className="input"
            >
              <option value="">— Изберете клиент —</option>
              {sortedCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {customerFullName(c)}
                  {c.phone ? ` · ${c.phone}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="card p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Информация за велосипеда
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Марка</label>
              <input
                name="brand"
                defaultValue={bicycle?.brand}
                required
                placeholder="Cube"
                className="input"
              />
            </div>
            <div>
              <label className="label">Модел</label>
              <input
                name="model"
                defaultValue={bicycle?.model}
                required
                placeholder="Aim SL"
                className="input"
              />
            </div>
            <div>
              <label className="label">Година</label>
              <input
                name="year"
                type="number"
                inputMode="numeric"
                min="1900"
                max="2100"
                defaultValue={bicycle?.year}
                placeholder="2023"
                className="input"
              />
            </div>
            <div>
              <label className="label">Тип</label>
              <select
                name="type"
                defaultValue={bicycle?.type ?? ""}
                className="input"
              >
                <option value="">— Изберете —</option>
                {BIKE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Цвят</label>
              <input
                name="color"
                defaultValue={bicycle?.color}
                placeholder="Черен / червен"
                className="input"
              />
            </div>
            <div>
              <label className="label">Сериен номер</label>
              <input
                name="serialNumber"
                defaultValue={bicycle?.serialNumber}
                placeholder="напр. CB22A12345"
                className="input"
              />
            </div>
            <div>
              <label className="label">Размер на рамка</label>
              <input
                name="frameSize"
                defaultValue={bicycle?.frameSize}
                placeholder='M (18")'
                className="input"
              />
            </div>
            <div>
              <label className="label">Размер на колелата</label>
              <input
                name="wheelSize"
                defaultValue={bicycle?.wheelSize}
                placeholder='29"'
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <label className="label">Бележки</label>
          <textarea
            name="notes"
            defaultValue={bicycle?.notes}
            rows={4}
            placeholder="Особености, аксесоари, история на велосипеда..."
            className="input"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="card sticky top-20 p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <SubmitButton>{submitLabel}</SubmitButton>
            <Link href="/bicycles" className="btn-secondary">
              Отказ
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
