"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newId, updateDb } from "@/lib/db";
import { computePaymentStatus } from "@/lib/crm";
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

export async function createServiceRecord(formData: FormData) {
  const data = readBase(formData);
  const now = new Date().toISOString();
  const id = newId("srv");

  await updateDb(async (db) => {
    const bike = db.bicycles.find((b) => b.id === data.bicycleId);
    if (!bike) throw new Error("Велосипедът не съществува");
    db.serviceRecords.push({
      id,
      customerId: bike.customerId,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  });

  revalidatePath("/");
  revalidatePath("/services");
  redirect(`/services/${id}`);
}

export async function updateServiceRecord(id: string, formData: FormData) {
  const data = readBase(formData);

  await updateDb(async (db) => {
    const s = db.serviceRecords.find((s) => s.id === id);
    if (!s) throw new Error("Сервизният запис не е намерен");
    const bike = db.bicycles.find((b) => b.id === data.bicycleId);
    if (!bike) throw new Error("Велосипедът не съществува");
    Object.assign(s, data, {
      customerId: bike.customerId,
      updatedAt: new Date().toISOString(),
    });
  });

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${id}`);
  redirect("/services");
}

export async function deleteServiceRecord(id: string) {
  await updateDb(async (db) => {
    db.serviceRecords = db.serviceRecords.filter((s) => s.id !== id);
  });
  revalidatePath("/");
  revalidatePath("/services");
}
