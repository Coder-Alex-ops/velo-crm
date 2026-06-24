import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { ServiceForm } from "@/components/ServiceForm";
import { readDb } from "@/lib/db";
import { updateServiceRecord } from "../actions";
import { DeleteServiceButton } from "../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditService({
  params,
}: {
  params: { id: string };
}) {
  const db = await readDb();
  const record = db.serviceRecords.find((s) => s.id === params.id);
  if (!record) notFound();

  const action = updateServiceRecord.bind(null, record.id);

  return (
    <>
      <TopBar status={`Сервиз · ${record.id}`} />
      <div className="px-8 py-6">
        <PageHeader
          title="Сервизен запис"
          subtitle={`ID ${record.id}`}
          actions={<DeleteServiceButton id={record.id} />}
        />
        <ServiceForm
          record={record}
          customers={db.customers}
          bicycles={db.bicycles}
          action={action}
          submitLabel="Запази промените"
        />
      </div>
    </>
  );
}
