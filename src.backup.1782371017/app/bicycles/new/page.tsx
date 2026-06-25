import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { BicycleForm } from "@/components/BicycleForm";
import { listCustomers } from "@/lib/db";
import { createBicycle } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewBicycle({
  searchParams,
}: {
  searchParams: { customerId?: string };
}) {
  const customers = await listCustomers();
  return (
    <>
      <TopBar status="Нов велосипед" />
      <div className="page-container">
        <PageHeader
          title="Нов велосипед"
          subtitle="Заведете велосипед на клиент"
        />
        <BicycleForm
          customers={customers}
          defaultCustomerId={searchParams.customerId}
          action={createBicycle}
          submitLabel="Запази"
        />
      </div>
    </>
  );
}
