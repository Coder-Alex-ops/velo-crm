import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { ServiceForm } from "@/components/ServiceForm";
import {
  getServiceRecord,
  listBicycles,
  listCustomers,
  listServiceCatalog,
  listServiceLaborItems,
} from "@/lib/db";
import { requireUser } from "@/lib/session";
import { updateServiceRecord } from "../actions";
import { DeleteServiceButton } from "../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditService({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const record = await getServiceRecord(user.organizationId, params.id);
  if (!record) notFound();

  const [customers, bicycles, catalogItems, laborItems] = await Promise.all([
    listCustomers(user.organizationId),
    listBicycles(user.organizationId),
    listServiceCatalog(user.organizationId),
    listServiceLaborItems(params.id),
  ]);

  const action = updateServiceRecord.bind(null, record.id);

  return (
    <>
      <TopBar status={`Сервиз · ${record.id}`} />
      <div className="page-container">
        <PageHeader
          title="Сервизен запис"
          subtitle={`ID ${record.id}`}
          actions={<DeleteServiceButton id={record.id} />}
        />
        <ServiceForm
          record={record}
          customers={customers}
          bicycles={bicycles}
          catalogItems={catalogItems}
          laborItems={laborItems}
          action={action}
          submitLabel="Запази промените"
        />
      </div>
    </>
  );
}
