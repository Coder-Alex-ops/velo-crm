"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Bicycle, Customer, ServiceRecord } from "@/lib/types";
import {
  SERVICE_STATUSES,
  bicycleLabel,
  customerFullName,
  formatEur,
} from "@/lib/crm";

export function ServiceForm({
  record,
  customers,
  bicycles,
  defaultCustomerId,
  defaultBicycleId,
  action,
  submitLabel,
}: {
  record?: ServiceRecord;
  customers: Customer[];
  bicycles: Bicycle[];
  defaultCustomerId?: string;
  defaultBicycleId?: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const customersById = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers],
  );

  const initialBike = record
    ? bicycles.find((b) => b.id === record.bicycleId)
    : defaultBicycleId
      ? bicycles.find((b) => b.id === defaultBicycleId)
      : undefined;

  const initialCustomerId =
    record?.customerId ?? initialBike?.customerId ?? defaultCustomerId ?? "";

  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [bicycleId, setBicycleId] = useState(
    record?.bicycleId ?? defaultBicycleId ?? "",
  );
  const [partsCost, setPartsCost] = useState(record?.partsCost ?? 0);
  const [laborCost, setLaborCost] = useState(record?.laborCost ?? 0);
  const [discount, setDiscount] = useState(record?.discount ?? 0);
  const [paidAmount, setPaidAmount] = useState(record?.paidAmount ?? 0);

  const total = Math.max(0, partsCost + laborCost - discount);
  const balance = total - paidAmount;

  const filteredBikes = customerId
    ? bicycles.filter((b) => b.customerId === customerId)
    : bicycles;

  const today = new Date().toISOString().slice(0, 10);
  const receivedDefault = record?.receivedDate?.slice(0, 10) ?? today;
  const completedDefault = record?.completedDate?.slice(0, 10) ?? "";

  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Клиент и велосипед
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Клиент</label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setBicycleId("");
                }}
                className="input"
              >
                <option value="">— Всички клиенти —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {customerFullName(c)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Филтрира списъка с велосипеди.
              </p>
            </div>
            <div>
              <label className="label">Велосипед</label>
              {filteredBikes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                  {customerId ? (
                    <>
                      Този клиент няма заведени велосипеди.{" "}
                      <Link
                        href={`/bicycles/new?customerId=${customerId}`}
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        Добави
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      Няма заведени велосипеди.{" "}
                      <Link
                        href="/bicycles/new"
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        Добави
                      </Link>
                      .
                    </>
                  )}
                </div>
              ) : (
                <select
                  name="bicycleId"
                  required
                  value={bicycleId}
                  onChange={(e) => setBicycleId(e.target.value)}
                  className="input"
                >
                  <option value="">— Изберете велосипед —</option>
                  {filteredBikes.map((b) => {
                    const owner = customersById.get(b.customerId);
                    return (
                      <option key={b.id} value={b.id}>
                        {bicycleLabel(b)}
                        {owner ? ` · ${customerFullName(owner)}` : ""}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Извършена работа
          </h3>
          <div>
            <label className="label">Описание на работата</label>
            <textarea
              name="workDescription"
              defaultValue={record?.workDescription}
              required
              rows={4}
              placeholder="Напр. Смяна на верига и касета, регулиране на скорости и спирачки..."
              className="input"
            />
          </div>
          <div className="mt-4">
            <label className="label">Използвани части / резервни части</label>
            <textarea
              name="partsList"
              defaultValue={record?.partsList}
              rows={3}
              placeholder="Напр. Верига KMC X11, касета Shimano CS-HG500..."
              className="input"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Майстор / техник</label>
              <input
                name="technician"
                defaultValue={record?.technician}
                placeholder="Майстор Георги"
                className="input"
              />
            </div>
            <div>
              <label className="label">Статус</label>
              <select
                name="status"
                defaultValue={record?.status ?? "received"}
                className="input"
              >
                {SERVICE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Дата на приемане</label>
              <input
                type="date"
                name="receivedDate"
                defaultValue={receivedDefault}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Дата на завършване</label>
              <input
                type="date"
                name="completedDate"
                defaultValue={completedDefault}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <label className="label">Вътрешни бележки</label>
          <textarea
            name="notes"
            defaultValue={record?.notes}
            rows={3}
            placeholder="Препоръки към клиента, наблюдения, бъдеща работа..."
            className="input"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Калкулация
          </h3>
          <div className="space-y-3">
            <div>
              <label className="label">Цена на части (€)</label>
              <input
                name="partsCost"
                type="number"
                step="0.01"
                min="0"
                value={partsCost}
                onChange={(e) => setPartsCost(Number(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Труд (€)</label>
              <input
                name="laborCost"
                type="number"
                step="0.01"
                min="0"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Отстъпка (€)</label>
              <input
                name="discount"
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Платена сума (€)</label>
              <input
                name="paidAmount"
                type="number"
                step="0.01"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                className="input"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Междинна сума</span>
              <span>{formatEur(partsCost + laborCost)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Отстъпка</span>
              <span>− {formatEur(discount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
              <span>Общо</span>
              <span>{formatEur(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Платено</span>
              <span>{formatEur(paidAmount)}</span>
            </div>
            <div
              className={`flex justify-between font-semibold ${
                balance > 0
                  ? "text-red-600"
                  : balance < 0
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              <span>{balance < 0 ? "Надплатено" : "Остатък"}</span>
              <span>{formatEur(Math.abs(balance))}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-col gap-2">
            <button type="submit" className="btn-primary">
              {submitLabel}
            </button>
            <Link href="/services" className="btn-secondary">
              Отказ
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
