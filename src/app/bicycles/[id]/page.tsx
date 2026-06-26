import Link from "next/link";
import clsx from "clsx";
import { notFound } from "next/navigation";
import { Plus, Wrench } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { BicycleForm } from "@/components/BicycleForm";
import {
  getBicycle,
  listCustomers,
  listServiceRecordsByBicycle,
} from "@/lib/db";
import { formatDate } from "@/lib/format";
import {
  bicycleLabel,
  formatEur,
  paymentStatusMeta,
  serviceStatusMeta,
  serviceTotal,
} from "@/lib/crm";
import { requireUser } from "@/lib/session";
import { updateBicycle } from "../actions";
import { DeleteBicycleButton } from "../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditBicycle({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const bicycle = await getBicycle(user.organizationId, params.id);
  if (!bicycle) notFound();

  const [customers, services] = await Promise.all([
    listCustomers(user.organizationId),
    listServiceRecordsByBicycle(user.organizationId, bicycle.id),
  ]);

  const action = updateBicycle.bind(null, bicycle.id);

  return (
    <>
      <TopBar status={`Велосипед · ${bicycleLabel(bicycle)}`} />
      <div className="page-container">
        <PageHeader
          title={bicycleLabel(bicycle)}
          subtitle={`Добавен на ${formatDate(bicycle.createdAt)}`}
          actions={<DeleteBicycleButton id={bicycle.id} />}
        />
        <BicycleForm
          bicycle={bicycle}
          customers={customers}
          action={action}
          submitLabel="Запази промените"
        />

        <div className="card mt-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Wrench className="h-4 w-4 text-gray-500" />
              История на сервиза
            </h3>
            <Link
              href={`/services/new?bicycleId=${bicycle.id}&customerId=${bicycle.customerId}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Нов запис
            </Link>
          </div>
          {services.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              Този велосипед все още не е сервизиран.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {services.map((s) => {
                const sm = serviceStatusMeta(s.status);
                const pm = paymentStatusMeta(s.paymentStatus);
                return (
                  <li key={s.id} className="py-3">
                    <Link
                      href={`/services/${s.id}`}
                      className="block hover:text-brand-600"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-900">
                            {s.workDescription.slice(0, 80) || "Сервиз"}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            Приет: {formatDate(s.receivedDate)}
                            {s.technician
                              ? ` · Майстор: ${s.technician}`
                              : ""}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
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
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
