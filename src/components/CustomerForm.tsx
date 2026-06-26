"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, ChevronDown, ChevronUp } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import type { Customer } from "@/lib/types";
import { BIKE_TYPES } from "@/lib/crm";

export function CustomerForm({
  customer,
  action,
  submitLabel,
}: {
  customer?: Customer;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const [addBike, setAddBike] = useState(false);
  const isEdit = !!customer;

  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">

        {/* Основни данни */}
        <div className="card p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900">Основни данни</h3>
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
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Телефон</label>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                defaultValue={customer?.phone ?? undefined}
                placeholder="+359 88 123 4567"
                className="input"
              />
            </div>
            <div>
              <label className="label">Имейл</label>
              <input
                name="email"
                type="email"
                inputMode="email"
                defaultValue={customer?.email ?? undefined}
                placeholder="ivan@example.com"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Адрес */}
        <div className="card p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900">Адрес</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Улица и номер</label>
              <input
                name="address"
                defaultValue={customer?.address ?? undefined}
                placeholder="ул. Витоша 12"
                className="input"
              />
            </div>
            <div>
              <label className="label">Град</label>
              <input
                name="city"
                defaultValue={customer?.city ?? undefined}
                placeholder="София"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Бележки */}
        <div className="card p-4 sm:p-6">
          <label className="label">Бележки за клиента</label>
          <textarea
            name="notes"
            defaultValue={customer?.notes ?? undefined}
            rows={3}
            placeholder="Предпочитания, история, специални условия..."
            className="input"
          />
        </div>

        {/* Велосипед — само при нов клиент */}
        {!isEdit && (
          <div className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setAddBike((v) => !v)}
              className="flex w-full items-center justify-between p-4 text-left sm:p-6"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10">
                  <Bike className="h-4 w-4 text-brand-600" />
                </div>
                <span className="text-sm font-semibold text-zinc-900">
                  Добави велосипед
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                  по желание
                </span>
              </div>
              {addBike
                ? <ChevronUp className="h-4 w-4 text-zinc-400" />
                : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>

            {addBike && (
              <div className="border-t border-zinc-100 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Марка <span className="text-red-500">*</span></label>
                    <input
                      name="bike_brand"
                      required={addBike}
                      placeholder="Cube"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Модел <span className="text-red-500">*</span></label>
                    <input
                      name="bike_model"
                      required={addBike}
                      placeholder="Aim SL"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Година</label>
                    <input
                      name="bike_year"
                      type="number"
                      inputMode="numeric"
                      min="1900"
                      max="2100"
                      placeholder="2023"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Тип</label>
                    <select name="bike_type" className="input">
                      <option value="">— Изберете —</option>
                      {BIKE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Цвят</label>
                    <input
                      name="bike_color"
                      placeholder="Черен / червен"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Сериен номер</label>
                    <input
                      name="bike_serial"
                      placeholder="CB22A12345"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Размер рамка</label>
                    <input
                      name="bike_frameSize"
                      placeholder='M (18")'
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Размер колела</label>
                    <input
                      name="bike_wheelSize"
                      placeholder='29"'
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="card sticky top-20 p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <SubmitButton>{submitLabel}</SubmitButton>
            <Link href="/customers" className="btn-secondary">
              Отказ
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
