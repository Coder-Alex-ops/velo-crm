"use server";

import { revalidatePath } from "next/cache";
import {
  createServiceCatalogItem,
  deleteServiceCatalogItem,
  updateServiceCatalogItem,
} from "@/lib/db";
import { requireUser } from "@/lib/session";

function parseMoney(raw: string, label: string): number {
  if (!raw.trim()) return 0;
  const n = Number(raw.replace(",", "."));
  if (Number.isNaN(n) || n < 0)
    throw new Error(`${label} трябва да е положително число`);
  return n;
}

export async function createCatalogItem(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Нямате права");

  const name = String(formData.get("name") ?? "").trim();
  const defaultPrice = parseMoney(
    String(formData.get("defaultPrice") ?? ""),
    "Цена",
  );
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!name) throw new Error("Името е задължително");

  await createServiceCatalogItem({
    organizationId: user.organizationId,
    name,
    defaultPrice,
    sortOrder,
  });

  revalidatePath("/services/catalog");
}

export async function updateCatalogItem(id: string, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Нямате права");

  const name = String(formData.get("name") ?? "").trim();
  const defaultPrice = parseMoney(
    String(formData.get("defaultPrice") ?? ""),
    "Цена",
  );
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = formData.get("isActive") === "true";

  if (!name) throw new Error("Името е задължително");

  await updateServiceCatalogItem(user.organizationId, id, {
    name,
    defaultPrice,
    isActive,
    sortOrder,
  });

  revalidatePath("/services/catalog");
}

export async function deleteCatalogItem(id: string) {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Нямате права");
  await deleteServiceCatalogItem(user.organizationId, id);
  revalidatePath("/services/catalog");
}
