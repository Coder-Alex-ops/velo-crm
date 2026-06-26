import Link from "next/link";
import { Bike, Pencil, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import {
  countServicesByBicycle,
  listBicyclesWithCustomer,
} from "@/lib/db";
import { bikeTypeLabel } from "@/lib/crm";
import { requireUser } from "@/lib/session";
import { DeleteBicycleRowButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function BicyclesIndex() {
  const user = await requireUser();
  const [bicycles, serviceCounts] = await Promise.all([
    listBicyclesWithCustomer(user.organizationId),
    countServicesByBicycle(user.organizationId),
  ]);

  return (
    <>
      <TopBar
        status={`${bicycles.length} велосипеда`}
        action={{ label: "Нов велосипед", href: "/bicycles/new" }}
      />
      <div className="page-container">
        <PageHeader
          title="Велосипеди"
          subtitle="Всички велосипеди, заведени в системата"
        />

        {bicycles.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <Bike className="mb-3 h-10 w-10 text-gray-300" />
            <p className="mb-3 text-sm text-gray-500">
              Все още няма добавени велосипеди.
            </p>
            <Link href="/bicycles/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Добави велосипед
            </Link>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Велосипед</th>
                  <th className="px-6 py-3">Клиент</th>
                  <th className="px-6 py-3">Тип</th>
                  <th className="px-6 py-3">Сериен №</th>
                  <th className="px-6 py-3">Рамка / Колела</th>
                  <th className="px-6 py-3">Сервизи</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bicycles.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/bicycles/${b.id}`}
                          className="font-medium text-gray-900 hover:text-brand-600"
                        >
                          {b.brand} {b.model}
                        </Link>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {b.year ?? "—"}
                          {b.color ? ` · ${b.color}` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/customers/${b.customerId}`}
                          className="text-gray-700 hover:text-brand-600"
                        >
                          {b.customerName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {bikeTypeLabel(b.type ?? undefined)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700">
                        {b.serialNumber ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {b.frameSize ?? "—"}
                        {b.wheelSize ? ` · ${b.wheelSize}` : ""}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {serviceCounts.get(b.id) ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/bicycles/${b.id}`}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Редактирай"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteBicycleRowButton id={b.id} />
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
