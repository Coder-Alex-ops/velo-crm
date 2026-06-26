import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default function NewProduct() {
  return (
    <>
      <TopBar status="Нов продукт" />
      <div className="page-container">
        <PageHeader
          title="Нов продукт"
          subtitle="Добави продукт в склада"
        />
        <ProductForm
          action={createProduct}
          submitLabel="Добави продукт"
          showInitialQuantity
        />
      </div>
    </>
  );
}
