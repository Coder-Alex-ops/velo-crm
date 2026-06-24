import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { BicycleForm } from "@/components/BicycleForm";
import { readDb } from "@/lib/db";
import { createBicycle } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewBicycle({
  searchParams,
}: {
  searchParams: { customerId?: string };
}) {
  const db = await readDb();
  return (
    <>
      <TopBar status="Нов велосипед" />
      <div className="px-8 py-6">
        <PageHeader
          title="Нов велосипед"
          subtitle="Заведете велосипед на клиент"
        />
        <BicycleForm
          customers={db.customers}
          defaultCustomerId={searchParams.customerId}
          action={createBicycle}
          submitLabel="Запази"
        />
      </div>
    </>
  );
}
