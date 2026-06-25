import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { ServiceForm } from "@/components/ServiceForm";
import { getServiceRecord, listBicycles, listCustomers } from "@/lib/db";
import { updateServiceRecord } from "../actions";
import { DeleteServiceButton } from "../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditService({
  params,
}: {
  params: { id: string };
}) {
  const record = await getServiceRecord(params.id);
  if (!record) notFound();

  const [customers, bicycles] = await Promise.all([
    listCustomers(),
    listBicycles(),
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
          action={action}
          submitLabel="Запази промените"
        />
      </div>
    </>
  );
}
