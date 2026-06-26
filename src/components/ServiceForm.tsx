"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import type {
  Bicycle,
  Customer,
  ServiceCatalogItem,
  ServiceLaborItem,
  ServiceRecord,
} from "@/lib/types";
import {
  SERVICE_STATUSES,
  bicycleLabel,
  customerFullName,
  formatEur,
} from "@/lib/crm";

function moneyToString(n?: number): string {
  if (n === undefined || n === null || Number.isNaN(n) || n === 0) return "";
  return String(n);
}

function parseMoney(value: string): number {
  if (!value.trim()) return 0;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function MoneyField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-400">
          €
        </span>
        <input
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="0.00"
          className="money-input"
        />
      </div>
    </div>
  );
}

type LaborLine = { key: string; name: string; price: string };

export function ServiceForm({
  record,
  customers,
  bicycles,
  catalogItems,
  laborItems,
  defaultCustomerId,
  defaultBicycleId,
  action,
  submitLabel,
}: {
  record?: ServiceRecord;
  customers: Customer[];
  bicycles: Bicycle[];
  catalogItems: ServiceCatalogItem[];
  laborItems?: ServiceLaborItem[];
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
  const [partsCost, setPartsCost] = useState(moneyToString(record?.partsCost));
  const [discount, setDiscount] = useState(moneyToString(record?.discount));
  const [paidAmount, setPaidAmount] = useState(
    moneyToString(record?.paidAmount),
  );

  const [lines, setLines] = useState<LaborLine[]>(() => {
    if (laborItems?.length) {
      return laborItems.map((item, i) => ({
        key: `existing-${i}`,
        name: item.name,
        price: moneyToString(item.price),
      }));
    }
    if (record?.laborCost && record.laborCost > 0) {
      return [{ key: "legacy", name: "Труд", price: moneyToString(record.laborCost) }];
    }
    return [];
  });

  const [catalogSelect, setCatalogSelect] = useState("");

  const activeCatalog = useMemo(
    () => catalogItems.filter((c) => c.isActive),
    [catalogItems],
  );

  function addFromCatalog(catalogId: string) {
    const item = activeCatalog.find((c) => c.id === catalogId);
    if (!item) return;
    setLines((ls) => [
      ...ls,
      { key: `cat-${Date.now()}`, name: item.name, price: moneyToString(item.defaultPrice) },
    ]);
    setCatalogSelect("");
  }

  function addManual() {
    setLines((ls) => [...ls, { key: `m-${Date.now()}`, name: "", price: "" }]);
  }

  function updateLine(key: string, field: "name" | "price", value: string) {
    setLines((ls) =>
      ls.map((l) => (l.key === key ? { ...l, [field]: value } : l)),
    );
  }

  function removeLine(key: string) {
    setLines((ls) => ls.filter((l) => l.key !== key));
  }

  const partsCostN = parseMoney(partsCost);
  const laborCostN = lines.reduce((sum, l) => sum + parseMoney(l.price), 0);
  const discountN = parseMoney(discount);
  const paidAmountN = parseMoney(paidAmount);
  const total = Math.max(0, partsCostN + laborCostN - discountN);
  const balance = total - paidAmountN;

  const filteredBikes = customerId
    ? bicycles.filter((b) => b.customerId === customerId)
    : bicycles;

  const today = new Date().toISOString().slice(0, 10);
  const receivedDefault = record?.receivedDate?.slice(0, 10) ?? today;
  const completedDefault = record?.completedDate?.slice(0, 10) ?? "";

  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Hidden labor item fields submitted with the form */}
      <div className="hidden">
        <input type="hidden" name="labor_count" value={String(lines.length)} />
        {lines.map((line, i) => (
          <span key={line.key}>
            <input type="hidden" name={`labor_name_${i}`} value={line.name} />
            <input type="hidden" name={`labor_price_${i}`} value={line.price} />
          </span>
        ))}
        <input type="hidden" name="laborCost" value={String(laborCostN)} />
      </div>

      <div className="space-y-4 lg:col-span-2">
        {/* Client & bicycle */}
        <div className="card p-4 sm:p-6">
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
                      Няма велосипеди.{" "}
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
                      Няма велосипеди.{" "}
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

        {/* Work description */}
        <div className="card p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Извършена работа
          </h3>
          <div>
            <label className="label">Описание на работата</label>
            <textarea
              name="workDescription"
              defaultValue={record?.workDescription ?? undefined}
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
              defaultValue={record?.partsList ?? undefined}
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
                defaultValue={record?.technician ?? undefined}
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

        {/* Labor items */}
        <div className="card p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Услуги / Труд
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {activeCatalog.length > 0 && (
                <select
                  value={catalogSelect}
                  onChange={(e) => {
                    if (e.target.value) addFromCatalog(e.target.value);
                  }}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">+ От ценоразпис</option>
                  {activeCatalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {formatEur(c.defaultPrice)}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={addManual}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Ръчно
              </button>
            </div>
          </div>

          {lines.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">
              Изберете услуга от ценоразписа или добавете ръчно
            </p>
          ) : (
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={line.key} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={line.name}
                    onChange={(e) => updateLine(line.key, "name", e.target.value)}
                    placeholder={`Услуга ${i + 1}`}
                    className="input min-w-0 flex-1 py-2 text-sm"
                  />
                  <div className="relative w-32 shrink-0">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-gray-400">
                      €
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={line.price}
                      onChange={(e) =>
                        updateLine(line.key, "price", e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      placeholder="0.00"
                      className="money-input py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-end border-t border-zinc-100 pt-2">
                <span className="text-sm text-zinc-600">
                  Общо труд:{" "}
                  <span className="font-semibold">{formatEur(laborCostN)}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card p-4 sm:p-6">
          <label className="label">Вътрешни бележки</label>
          <textarea
            name="notes"
            defaultValue={record?.notes ?? undefined}
            rows={3}
            placeholder="Препоръки към клиента, наблюдения, бъдеща работа..."
            className="input"
          />
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <div className="card sticky top-20 p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Калкулация
          </h3>
          <div className="space-y-3">
            <MoneyField
              name="partsCost"
              label="Части (€)"
              value={partsCost}
              onChange={setPartsCost}
            />

            <div>
              <label className="label">Труд (€)</label>
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                <span className="text-sm text-zinc-500">
                  {lines.length === 0
                    ? "Без услуги"
                    : `${lines.length} услуг${lines.length === 1 ? "а" : "и"}`}
                </span>
                <span className="text-sm font-semibold tabular-nums text-zinc-800">
                  {formatEur(laborCostN)}
                </span>
              </div>
            </div>

            <MoneyField
              name="discount"
              label="Отстъпка (€)"
              value={discount}
              onChange={setDiscount}
            />
            <MoneyField
              name="paidAmount"
              label="Платено (€)"
              value={paidAmount}
              onChange={setPaidAmount}
            />
          </div>

          <div className="mt-5 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Части</span>
              <span className="tabular-nums">{formatEur(partsCostN)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Труд</span>
              <span className="tabular-nums">{formatEur(laborCostN)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Отстъпка</span>
              <span className="tabular-nums">− {formatEur(discountN)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
              <span>Общо</span>
              <span className="tabular-nums">{formatEur(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Платено</span>
              <span className="tabular-nums">{formatEur(paidAmountN)}</span>
            </div>
            <div
              className={`flex justify-between font-semibold tabular-nums ${
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

        <div className="card p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <SubmitButton>{submitLabel}</SubmitButton>
            <Link href="/services" className="btn-secondary">
              Отказ
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
