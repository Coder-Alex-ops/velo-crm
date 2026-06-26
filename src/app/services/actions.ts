"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServiceRecordRow,
  deleteServiceRecordRow,
  getBicycle,
  replaceServiceLaborItems,
  updateServiceRecordRow,
} from "@/lib/db";
import { computePaymentStatus } from "@/lib/crm";
import { requireUser } from "@/lib/session";
import type { ServiceStatus } from "@/lib/types";

const STATUS_VALUES: ServiceStatus[] = [
  "received",
  "in_progress",
  "waiting_parts",
  "ready",
  "delivered",
  "cancelled",
];

function parseStatus(value: string): ServiceStatus {
  return STATUS_VALUES.includes(value as ServiceStatus)
    ? (value as ServiceStatus)
    : "received";
}

function parseMoney(raw: string, label: string): number {
  if (!raw.trim()) return 0;
  const n = Number(raw.replace(",", "."));
  if (Number.isNaN(n) || n < 0) {
    throw new Error(`${label} трябва да е положително число`);
  }
  return n;
}

function readBase(formData: FormData) {
  const bicycleId = String(formData.get("bicycleId") ?? "").trim();
  const receivedDate = String(formData.get("receivedDate") ?? "").trim();
  const completedDate = String(formData.get("completedDate") ?? "").trim();
  const workDescription = String(formData.get("workDescription") ?? "").trim();
  const partsList = String(formData.get("partsList") ?? "");
  const partsCost = parseMoney(
    String(formData.get("partsCost") ?? ""),
    "Цена на части",
  );
  const laborCost = parseMoney(
    String(formData.get("laborCost") ?? ""),
    "Труд",
  );
  const discount = parseMoney(
    String(formData.get("discount") ?? ""),
    "Отстъпка",
  );
  const paidAmount = parseMoney(
    String(formData.get("paidAmount") ?? ""),
    "Платена сума",
  );
  const status = parseStatus(String(formData.get("status") ?? ""));
  const technician = String(formData.get("technician") ?? "").trim();
  const notes = String(formData.get("notes") ?? "");

  if (!bicycleId) throw new Error("Изберете велосипед");
  if (!receivedDate) throw new Error("Датата на приемане е задължителна");
  if (!workDescription) throw new Error("Опишете извършената работа");

  const total = Math.max(0, partsCost + laborCost - discount);
  const paymentStatus = computePaymentStatus(total, paidAmount);

  return {
    bicycleId,
    receivedDate,
    completedDate: completedDate || undefined,
    workDescription,
    partsList: partsList || undefined,
    partsCost,
    laborCost,
    discount,
    paidAmount,
    paymentStatus,
    status,
    technician: technician || undefined,
    notes: notes || undefined,
  };
}

function readLaborItems(
  formData: FormData,
): { name: string; price: number; sortOrder: number }[] {
  const count = Number(formData.get("labor_count") ?? 0);
  const items: { name: string; price: number; sortOrder: number }[] = [];
  for (let i = 0; i < count; i++) {
    const name = String(formData.get(`labor_name_${i}`) ?? "").trim();
    const price = parseMoney(
      String(formData.get(`labor_price_${i}`) ?? ""),
      `Услуга ${i + 1}`,
    );
    if (name) items.push({ name, price, sortOrder: i });
  }
  return items;
}

export async function createServiceRecord(formData: FormData) {
  const user = await requireUser();
  const data = readBase(formData);
  const laborItems = readLaborItems(formData);

  const bike = await getBicycle(user.organizationId, data.bicycleId);
  if (!bike) throw new Error("Велосипедът не съществува");

  const created = await createServiceRecordRow({
    ...data,
    organizationId: user.organizationId,
    customerId: bike.customerId,
  });

  if (laborItems.length > 0) {
    await replaceServiceLaborItems(created.id, laborItems);
  }

  revalidatePath("/");
  revalidatePath("/services");
  redirect(`/services/${created.id}`);
}

export async function updateServiceRecord(id: string, formData: FormData) {
  const user = await requireUser();
  const data = readBase(formData);
  const laborItems = readLaborItems(formData);

  const bike = await getBicycle(user.organizationId, data.bicycleId);
  if (!bike) throw new Error("Велосипедът не съществува");

  await updateServiceRecordRow(user.organizationId, id, {
    ...data,
    customerId: bike.customerId,
  });

  await replaceServiceLaborItems(id, laborItems);

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${id}`);
  redirect("/services");
}

export async function deleteServiceRecord(id: string) {
  const user = await requireUser();
  await deleteServiceRecordRow(user.organizationId, id);
  revalidatePath("/");
  revalidatePath("/services");
}
