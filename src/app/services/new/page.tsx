import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { ServiceForm } from "@/components/ServiceForm";
import { readDb } from "@/lib/db";
import { createServiceRecord } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewService({
  searchParams,
}: {
  searchParams: { customerId?: string; bicycleId?: string };
}) {
  const db = await readDb();
  return (
    <>
      <TopBar status="Нов сервизен запис" />
      <div className="page-container">
        <PageHeader
          title="Нов сервиз"
          subtitle="Заведете нов ремонт или сервиз"
        />
        <ServiceForm
          customers={db.customers}
          bicycles={db.bicycles}
          defaultCustomerId={searchParams.customerId}
          defaultBicycleId={searchParams.bicycleId}
          action={createServiceRecord}
          submitLabel="Запази"
        />
      </div>
    </>
  );
}
