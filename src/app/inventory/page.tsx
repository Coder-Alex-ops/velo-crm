import Link from "next/link";
import clsx from "clsx";
import { Package, Pencil, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { listLowStockProducts, listProducts } from "@/lib/db";
import { formatEur } from "@/lib/crm";
import { DeleteProductRowButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  chain: "Верига",
  cassette: "Касета",
  tire: "Гума",
  brake: "Спирачка",
  cable: "Кабел",
  accessory: "Аксесоар",
  other: "Друго",
};

export default async function InventoryIndex({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const lowOnly = searchParams.filter === "low";
  const products = lowOnly ? await listLowStockProducts() : await listProducts();

  return (
    <>
      <TopBar
        status={`${products.length} продукта`}
        action={{ label: "Нов продукт", href: "/inventory/new" }}
      />
      <div className="page-container">
        <PageHeader
          title="Складова наличност"
          subtitle="Части, аксесоари и консумативи"
        />

        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/inventory"
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium",
              !lowOnly
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
            )}
          >
            Всички
          </Link>
          <Link
            href="/inventory?filter=low"
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium",
              lowOnly
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
            )}
          >
            Ниска наличност
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <Package className="mb-3 h-10 w-10 text-gray-300" />
            <p className="mb-3 text-sm text-gray-500">
              {lowOnly
                ? "Няма продукти с ниска наличност."
                : "Все още няма добавени продукти."}
            </p>
            {!lowOnly && (
              <Link href="/inventory/new" className="btn-primary">
                <Plus className="h-4 w-4" />
                Добави продукт
              </Link>
            )}
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Продукт</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Категория</th>
                  <th className="px-6 py-3 text-right">Цена</th>
                  <th className="px-6 py-3 text-center">Наличност</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const isLow = p.quantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/inventory/${p.id}`}
                          className="font-medium text-gray-900 hover:text-brand-600"
                        >
                          {p.name}
                        </Link>
                        {p.description && (
                          <div className="mt-0.5 truncate text-xs text-gray-500">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {p.sku ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {p.category
                          ? (CATEGORY_LABELS[p.category] ?? p.category)
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatEur(p.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={clsx(
                            "badge",
                            isLow
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700",
                          )}
                        >
                          {p.quantity} бр.
                        </span>
                        {isLow && (
                          <div className="mt-0.5 text-xs text-red-500">
                            мин. {p.lowStockThreshold}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/inventory/${p.id}`}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Редактирай"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteProductRowButton id={p.id} />
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
