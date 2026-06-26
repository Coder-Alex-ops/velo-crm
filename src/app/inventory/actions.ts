"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProductRow,
  createStockMovement,
  deleteProductRow,
  updateProductRow,
} from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { StockMovementType } from "@/lib/types";

function readBase(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const unitPrice = parseFloat(String(formData.get("unitPrice") ?? "0")) || 0;
  const lowStockThreshold =
    parseInt(String(formData.get("lowStockThreshold") ?? "5"), 10) || 0;

  if (!name) throw new Error("Наименованието е задължително");

  return {
    name,
    sku: sku || undefined,
    category: category || undefined,
    description: description || undefined,
    unitPrice,
    lowStockThreshold,
  };
}

export async function createProduct(formData: FormData) {
  const user = await requireUser();
  const data = readBase(formData);
  const quantity =
    parseInt(String(formData.get("quantity") ?? "0"), 10) || 0;
  const created = await createProductRow({ ...data, quantity, organizationId: user.organizationId });

  revalidatePath("/");
  revalidatePath("/inventory");
  redirect(`/inventory/${created.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await requireUser();
  const data = readBase(formData);
  await updateProductRow(user.organizationId, id, data);

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  redirect(`/inventory/${id}`);
}

export async function deleteProduct(id: string) {
  const user = await requireUser();
  await deleteProductRow(user.organizationId, id);
  revalidatePath("/");
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function adjustStock(productId: string, formData: FormData) {
  const user = await requireUser();
  const rawType = String(formData.get("adjustType") ?? "adjustment");
  const type: StockMovementType =
    rawType === "purchase" ? "purchase" : "adjustment";
  const delta = parseInt(String(formData.get("delta") ?? "0"), 10);
  const note = String(formData.get("note") ?? "").trim();

  if (!delta) throw new Error("Количеството не може да е 0");

  await createStockMovement({
    organizationId: user.organizationId,
    productId,
    type,
    quantityDelta: delta,
    note: note || undefined,
  });

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${productId}`);
}
