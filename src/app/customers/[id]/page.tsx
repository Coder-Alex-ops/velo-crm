import Link from "next/link";
import clsx from "clsx";
import { notFound } from "next/navigation";
import { Bike, Plus, Wrench } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { CustomerForm } from "@/components/CustomerForm";
import {
  getCustomer,
  listBicyclesByCustomer,
  listServiceRecordsByCustomer,
} from "@/lib/db";
import { formatDate } from "@/lib/format";
import {
  bicycleLabel,
  bikeTypeLabel,
  formatEur,
  paymentStatusMeta,
  serviceStatusMeta,
  serviceTotal,
} from "@/lib/crm";
import { updateCustomer } from "../actions";
import { DeleteCustomerButton } from "../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditCustomer({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  const [customerBikes, customerServices] = await Promise.all([
    listBicyclesByCustomer(customer.id),
    listServiceRecordsByCustomer(customer.id),
  ]);

  const bikesById = new Map(customerBikes.map((b) => [b.id, b]));

  const action = updateCustomer.bind(null, customer.id);

  return (
    <>
      <TopBar status={`Клиент · ${customer.firstName} ${customer.lastName}`} />
      <div className="page-container">
        <PageHeader
          title={`${customer.firstName} ${customer.lastName}`}
          subtitle={`Добавен на ${formatDate(customer.createdAt)}`}
          actions={<DeleteCustomerButton id={customer.id} />}
        />
        <CustomerForm
          customer={customer}
          action={action}
          submitLabel="Запази промените"
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Bike className="h-4 w-4 text-gray-500" />
                Велосипеди на клиента
              </h3>
              <Link
                href={`/bicycles/new?customerId=${customer.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Добави велосипед
              </Link>
            </div>
            {customerBikes.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Все още няма добавени велосипеди.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {customerBikes.map((b) => (
                  <li key={b.id} className="py-3">
                    <Link
                      href={`/bicycles/${b.id}`}
                      className="block hover:text-brand-600"
                    >
                      <div className="font-medium text-gray-900">
                        {bicycleLabel(b)}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {bikeTypeLabel(b.type ?? undefined)}
                        {b.color ? ` · ${b.color}` : ""}
                        {b.serialNumber ? ` · сериен № ${b.serialNumber}` : ""}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Wrench className="h-4 w-4 text-gray-500" />
                История на сервиза
              </h3>
              <Link
                href={`/services/new?customerId=${customer.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Нов запис
              </Link>
            </div>
            {customerServices.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Няма направени сервизи.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {customerServices.map((s) => {
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
                              {bicycleLabel(bikesById.get(s.bicycleId))} ·{" "}
                              {formatDate(s.receivedDate)}
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
      </div>
    </>
  );
}
