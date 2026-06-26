import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { ServiceForm } from "@/components/ServiceForm";
import { listBicycles, listCustomers, listServiceCatalog } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createServiceRecord } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewService({
  searchParams,
}: {
  searchParams: { customerId?: string; bicycleId?: string };
}) {
  const user = await requireUser();
  const [customers, bicycles, catalogItems] = await Promise.all([
    listCustomers(user.organizationId),
    listBicycles(user.organizationId),
    listServiceCatalog(user.organizationId),
  ]);
  return (
    <>
      <TopBar status="Нов сервизен запис" />
      <div className="page-container">
        <PageHeader
          title="Нов сервиз"
          subtitle="Заведете нов ремонт или сервиз"
        />
        <ServiceForm
          customers={customers}
          bicycles={bicycles}
          catalogItems={catalogItems}
          defaultCustomerId={searchParams.customerId}
          defaultBicycleId={searchParams.bicycleId}
          action={createServiceRecord}
          submitLabel="Запази"
        />
      </div>
    </>
  );
}
