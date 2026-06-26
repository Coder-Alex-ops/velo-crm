import Link from "next/link";
import clsx from "clsx";
import { Pencil, Plus, Wrench } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import {
  countServicesByStatus,
  listServicesWithDetails,
} from "@/lib/db";
import { formatDate } from "@/lib/format";
import {
  SERVICE_STATUSES,
  formatEur,
  paymentStatusMeta,
  serviceBalance,
  serviceStatusMeta,
  serviceTotal,
} from "@/lib/crm";
import type { ServiceStatus } from "@/lib/types";
import { requireUser } from "@/lib/session";
import { DeleteServiceRowButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function ServicesIndex({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await requireUser();
  const statusFilter = SERVICE_STATUSES.find(
    (s) => s.value === searchParams.status,
  )?.value as ServiceStatus | undefined;

  const [services, counts] = await Promise.all([
    listServicesWithDetails(user.organizationId, statusFilter),
    countServicesByStatus(user.organizationId),
  ]);

  return (
    <>
      <TopBar
        status={`${services.length} записа`}
        action={{ label: "Нов сервиз", href: "/services/new" }}
      />
      <div className="page-container">
        <PageHeader
          title="Сервизни записи"
          subtitle="Всички направени и текущи ремонти"
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Link
            href="/services"
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium",
              !statusFilter
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
            )}
          >
            Всички ({[...counts.values()].reduce((a, b) => a + b, 0)})
          </Link>
          {SERVICE_STATUSES.map((s) => (
            <Link
              key={s.value}
              href={`/services?status=${s.value}`}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium",
                statusFilter === s.value
                  ? `${s.bg} ${s.text} border-transparent`
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label} ({counts.get(s.value) ?? 0})
            </Link>
          ))}
        </div>

        {services.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <Wrench className="mb-3 h-10 w-10 text-gray-300" />
            <p className="mb-3 text-sm text-gray-500">Няма сервизни записи.</p>
            <Link href="/services/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Нов сервиз
            </Link>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Работа</th>
                  <th className="px-6 py-3">Клиент / Велосипед</th>
                  <th className="px-6 py-3">Приет</th>
                  <th className="px-6 py-3">Майстор</th>
                  <th className="px-6 py-3">Статус</th>
                  <th className="px-6 py-3 text-right">Общо</th>
                  <th className="px-6 py-3 text-right">Остатък</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => {
                  const sm = serviceStatusMeta(s.status);
                  const pm = paymentStatusMeta(s.paymentStatus);
                  const total = serviceTotal(s);
                  const balance = serviceBalance(s);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/services/${s.id}`}
                          className="font-medium text-gray-900 hover:text-brand-600"
                        >
                          {s.workDescription.slice(0, 60) || "Сервиз"}
                          {s.workDescription.length > 60 && "…"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-medium text-gray-800">
                          {s.customerName}
                        </div>
                        <div className="text-gray-500">
                          {s.bicycleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(s.receivedDate)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {s.technician ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx("badge", sm.bg, sm.text)}>
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatEur(total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={clsx("badge", pm.bg, pm.text)}>
                          {pm.label}
                        </span>
                        {balance > 0 && (
                          <div className="mt-0.5 text-xs text-red-600">
                            {formatEur(balance)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/services/${s.id}`}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Редактирай"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteServiceRowButton id={s.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
