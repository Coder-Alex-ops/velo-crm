import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { CustomerForm } from "@/components/CustomerForm";
import { createCustomer } from "../actions";

export const dynamic = "force-dynamic";

export default function NewCustomer() {
  return (
    <>
      <TopBar status="Нов клиент" />
      <div className="px-8 py-6">
        <PageHeader
          title="Нов клиент"
          subtitle="Добавяне на клиент в системата"
        />
        <CustomerForm action={createCustomer} submitLabel="Запази клиента" />
      </div>
    </>
  );
}
