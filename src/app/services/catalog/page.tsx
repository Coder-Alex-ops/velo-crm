import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { listServiceCatalog } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { CatalogList } from "./CatalogList";

export const dynamic = "force-dynamic";

export default async function ServiceCatalogPage() {
  const user = await requireUser();
  const items = await listServiceCatalog(user.organizationId);

  return (
    <>
      <TopBar status="Ценоразпис · Услуги" />
      <div className="page-container">
        <PageHeader
          title="Ценоразпис"
          subtitle="Управлявайте услугите и стандартните цени"
        />
        <CatalogList items={items} />
      </div>
    </>
  );
}
