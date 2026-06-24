"use client";

import Link from "next/link";
import type { Customer } from "@/lib/types";

export function CustomerForm({
  customer,
  action,
  submitLabel,
}: {
  customer?: Customer;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Основни данни
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Име</label>
              <input
                name="firstName"
                defaultValue={customer?.firstName}
                required
                placeholder="Иван"
                className="input"
              />
            </div>
            <div>
              <label className="label">Фамилия</label>
              <input
                name="lastName"
                defaultValue={customer?.lastName}
                required
                placeholder="Петров"
                className="input"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Телефон</label>
              <input
                name="phone"
                defaultValue={customer?.phone}
                placeholder="+359 88 123 4567"
                className="input"
              />
            </div>
            <div>
              <label className="label">Имейл</label>
              <input
                name="email"
                type="email"
                defaultValue={customer?.email}
                placeholder="ivan@example.com"
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Адрес</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Улица и номер</label>
              <input
                name="address"
                defaultValue={customer?.address}
                placeholder="ул. Витоша 12"
                className="input"
              />
            </div>
            <div>
              <label className="label">Град</label>
              <input
                name="city"
                defaultValue={customer?.city}
                placeholder="София"
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <label className="label">Бележки за клиента</label>
          <textarea
            name="notes"
            defaultValue={customer?.notes}
            rows={4}
            placeholder="Предпочитания, история, специални условия..."
            className="input"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <div className="flex flex-col gap-2">
            <button type="submit" className="btn-primary">
              {submitLabel}
            </button>
            <Link href="/customers" className="btn-secondary">
              Отказ
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
