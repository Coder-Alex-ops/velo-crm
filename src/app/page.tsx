import Link from "next/link";
import clsx from "clsx";
import {
  Bike,
  CircleDollarSign,
  Plus,
  UserCircle,
  Wrench,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { readDb } from "@/lib/db";
import { formatDate, greetingForNow, todayLong } from "@/lib/format";
import {
  bicycleLabel,
  customerFullName,
  formatEur,
  paymentStatusMeta,
  serviceBalance,
  serviceStatusMeta,
  serviceTotal,
} from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = await readDb();
  const customersById = new Map(db.customers.map((c) => [c.id, c]));
  const bikesById = new Map(db.bicycles.map((b) => [b.id, b]));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const services = [...db.serviceRecords].sort(
    (a, b) =>
      new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime(),
  );

  const open = services.filter(
    (s) => s.status !== "delivered" && s.status !== "cancelled",
  );
  const monthRevenue = services
    .filter((s) => new Date(s.receivedDate) >= monthStart)
    .reduce((sum, s) => sum + serviceTotal(s), 0);
  const outstanding = services.reduce((sum, s) => {
    const b = serviceBalance(s);
    return sum + (b > 0 ? b : 0);
  }, 0);

  const recent = services.slice(0, 8);

  return (
    <>
      <TopBar status="Velo CRM" />
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {greetingForNow()}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{todayLong()}</p>
        </div>

        <PageHeader
          title="Преглед на сервиза"
          subtitle="Клиенти, велосипеди и текущи поръчки"
          actions={
            <div className="flex items-center gap-2">
              <Link href="/customers/new" className="btn-secondary">
                <Plus className="h-4 w-4" />
                Клиент
              </Link>
              <Link href="/services/new" className="btn-primary">
                <Plus className="h-4 w-4" />
                Нов сервиз
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Клиенти"
            value={db.customers.length}
            icon={UserCircle}
            tone="brand"
          />
          <StatCard
            label="Велосипеди"
            value={db.bicycles.length}
            icon={Bike}
            tone="blue"
          />
          <StatCard
            label="Активни сервизи"
            value={open.length}
            hint={`${db.serviceRecords.length} общо`}
            icon={Wrench}
            tone="amber"
          />
          <StatCard
            label="Оборот този месец"
            value={formatEur(monthRevenue)}
            icon={CircleDollarSign}
            tone="green"
          />
          <StatCard
            label="За събиране"
            value={formatEur(outstanding)}
            hint="Неплатени остатъци"
            icon={CircleDollarSign}
            tone="amber"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Последни сервизи
              </h2>
              <Link
                href="/services"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Виж всички
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Все още няма записи.{" "}
                <Link
                  href="/services/new"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Започни първия
                </Link>
                .
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recent.map((s) => {
                  const sm = serviceStatusMeta(s.status);
                  const pm = paymentStatusMeta(s.paymentStatus);
                  const customer = customersById.get(s.customerId);
                  const bike = bikesById.get(s.bicycleId);
                  return (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/services/${s.id}`}
                          className="block truncate text-sm font-medium text-gray-900 hover:text-brand-600"
                        >
                          {s.workDescription.slice(0, 70) || "Сервиз"}
                        </Link>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {customerFullName(customer)} · {bicycleLabel(bike)} ·{" "}
                          {formatDate(s.receivedDate)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={clsx("badge", sm.bg, sm.text)}>
                          {sm.label}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          {formatEur(serviceTotal(s))}
                        </span>
                        <span className={clsx("badge", pm.bg, pm.text)}>
                          {pm.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Бързи действия
            </h2>
            <div className="space-y-2">
              <Link
                href="/services/new"
                className="btn-primary w-full justify-start"
              >
                <Wrench className="h-4 w-4" />
                Нов сервизен запис
              </Link>
              <Link
                href="/customers/new"
                className="btn-secondary w-full justify-start"
              >
                <UserCircle className="h-4 w-4" />
                Нов клиент
              </Link>
              <Link
                href="/bicycles/new"
                className="btn-secondary w-full justify-start"
              >
                <Bike className="h-4 w-4" />
                Нов велосипед
              </Link>
              <Link
                href="/services?status=ready"
                className="btn-ghost w-full justify-start"
              >
                Готови за предаване
              </Link>
              <Link
                href="/services?status=in_progress"
                className="btn-ghost w-full justify-start"
              >
                В процес на работа
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
