import { notFound } from "next/navigation";
import clsx from "clsx";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { ProductForm } from "@/components/ProductForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getProduct, listStockMovementsByProduct } from "@/lib/db";
import { formatEur } from "@/lib/crm";
import { formatDateTime } from "@/lib/format";
import { updateProduct, adjustStock } from "../actions";
import { DeleteProductButton } from "../DeleteButton";

export const dynamic = "force-dynamic";

const MOVEMENT_LABELS: Record<string, { label: string; sign: string }> = {
  pos_sale: { label: "Square продажба", sign: "−" },
  service_use: { label: "Използвано в сервиз", sign: "−" },
  purchase: { label: "Получена доставка", sign: "+" },
  adjustment: { label: "Корекция", sign: "±" },
};

export default async function EditProduct({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const movements = await listStockMovementsByProduct(params.id);
  const action = updateProduct.bind(null, product.id);
  const adjustAction = adjustStock.bind(null, product.id);
  const isLow = product.quantity <= product.lowStockThreshold;

  return (
    <>
      <TopBar status={`Склад · ${product.name}`} />
      <div className="page-container">
        <PageHeader
          title={product.name}
          subtitle={product.sku ? `SKU: ${product.sku}` : "Без SKU код"}
          actions={<DeleteProductButton id={product.id} />}
        />

        <div className="mb-6 flex items-center gap-4">
          <div
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold",
              isLow ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700",
            )}
          >
            Наличност: {product.quantity} бр.
            {isLow && (
              <span className="text-xs font-normal">(мин. {product.lowStockThreshold})</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Единична цена: {formatEur(product.unitPrice)}
          </div>
        </div>

        <ProductForm
          product={product}
          action={action}
          submitLabel="Запази промените"
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Stock adjustment */}
          <div className="card p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Корекция на наличността
            </h3>
            <form action={adjustAction} className="space-y-4">
              <div>
                <label className="label">Тип</label>
                <select name="adjustType" className="input">
                  <option value="purchase">Получена доставка (+)</option>
                  <option value="adjustment">Ръчна корекция (±)</option>
                </select>
              </div>
              <div>
                <label className="label">Количество</label>
                <input
                  name="delta"
                  type="number"
                  className="input"
                  placeholder="напр. 10 или -3"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Положително = добавяне, отрицателно = намаляване
                </p>
              </div>
              <div>
                <label className="label">Бележка</label>
                <input
                  name="note"
                  className="input"
                  placeholder="напр. Доставка от доставчик"
                />
              </div>
              <SubmitButton>Приложи корекция</SubmitButton>
            </form>
          </div>

          {/* Movement history */}
          <div className="card p-6 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              История на движенията
            </h3>
            {movements.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Все още няма записани движения.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="pb-2">Дата</th>
                      <th className="pb-2">Тип</th>
                      <th className="pb-2 text-right">Промяна</th>
                      <th className="pb-2">Бележка</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements.map((m) => {
                      const meta = MOVEMENT_LABELS[m.type] ?? {
                        label: m.type,
                        sign: "±",
                      };
                      const isPositive = m.quantityDelta > 0;
                      return (
                        <tr key={m.id}>
                          <td className="py-2 text-xs text-gray-500">
                            {formatDateTime(m.createdAt)}
                          </td>
                          <td className="py-2 text-gray-700">{meta.label}</td>
                          <td
                            className={clsx(
                              "py-2 text-right font-semibold tabular-nums",
                              isPositive ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {isPositive ? "+" : ""}
                            {m.quantityDelta}
                          </td>
                          <td className="py-2 text-xs text-gray-500">
                            {m.note ?? m.reference ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
