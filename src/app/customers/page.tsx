import Link from "next/link";
import { Bike, Mail, Pencil, Phone, Plus, UserCircle } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import {
  countBicyclesByCustomer,
  countServicesByCustomer,
  listCustomers,
} from "@/lib/db";
import { formatDate } from "@/lib/format";
import { DeleteCustomerRowButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function CustomersIndex() {
  const [customers, bikeCounts, serviceCounts] = await Promise.all([
    listCustomers(),
    countBicyclesByCustomer(),
    countServicesByCustomer(),
  ]);

  return (
    <>
      <TopBar
        status={`${customers.length} клиенти`}
        action={{ label: "Нов клиент", href: "/customers/new" }}
      />
      <div className="page-container">
        <PageHeader
          title="Клиенти"
          subtitle="Списък с всички клиенти на сервиза"
        />

        {customers.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <UserCircle className="mb-3 h-10 w-10 text-gray-300" />
            <p className="mb-3 text-sm text-gray-500">
              Все още няма добавени клиенти.
            </p>
            <Link href="/customers/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Добави първия клиент
            </Link>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Клиент</th>
                  <th className="px-6 py-3">Контакти</th>
                  <th className="px-6 py-3">Град</th>
                  <th className="px-6 py-3">Велосипеди</th>
                  <th className="px-6 py-3">Сервизи</th>
                  <th className="px-6 py-3">Добавен</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-medium text-gray-900 hover:text-brand-600"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {c.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {c.phone}
                        </div>
                      )}
                      {c.email && (
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {c.email}
                        </div>
                      )}
                      {!c.phone && !c.email && (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {c.city ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <Bike className="h-3.5 w-3.5 text-gray-400" />
                        {bikeCounts.get(c.id) ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {serviceCounts.get(c.id) ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${c.id}`}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Редактирай"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteCustomerRowButton id={c.id} />
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
