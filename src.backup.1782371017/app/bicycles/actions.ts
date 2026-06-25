"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBicycleRow,
  deleteBicycleRow,
  getCustomer,
  updateBicycleRow,
} from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { BikeType } from "@/lib/types";

const BIKE_TYPE_VALUES: BikeType[] = [
  "mountain",
  "road",
  "city",
  "hybrid",
  "electric",
  "gravel",
  "bmx",
  "kids",
  "other",
];

function parseType(value: string): BikeType | undefined {
  return BIKE_TYPE_VALUES.includes(value as BikeType)
    ? (value as BikeType)
    : undefined;
}

function readBase(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const type = parseType(String(formData.get("type") ?? ""));
  const color = String(formData.get("color") ?? "").trim();
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const frameSize = String(formData.get("frameSize") ?? "").trim();
  const wheelSize = String(formData.get("wheelSize") ?? "").trim();
  const notes = String(formData.get("notes") ?? "");

  if (!customerId) throw new Error("Изберете клиент");
  if (!brand) throw new Error("Марката е задължителна");
  if (!model) throw new Error("Моделът е задължителен");

  const year = yearRaw ? Number(yearRaw) : undefined;
  if (year !== undefined && (Number.isNaN(year) || year < 1900 || year > 2100)) {
    throw new Error("Невалидна година");
  }

  return {
    customerId,
    brand,
    model,
    year,
    type,
    color: color || undefined,
    serialNumber: serialNumber || undefined,
    frameSize: frameSize || undefined,
    wheelSize: wheelSize || undefined,
    notes: notes || undefined,
  };
}

export async function createBicycle(formData: FormData) {
  await requireUser();
  const data = readBase(formData);

  const customer = await getCustomer(data.customerId);
  if (!customer) throw new Error("Клиентът не съществува");

  const created = await createBicycleRow(data);

  revalidatePath("/");
  revalidatePath("/bicycles");
  revalidatePath(`/customers/${data.customerId}`);
  redirect(`/bicycles/${created.id}`);
}

export async function updateBicycle(id: string, formData: FormData) {
  await requireUser();
  const data = readBase(formData);
  await updateBicycleRow(id, data);

  revalidatePath("/");
  revalidatePath("/bicycles");
  revalidatePath(`/bicycles/${id}`);
  revalidatePath(`/customers/${data.customerId}`);
  redirect("/bicycles");
}

export async function deleteBicycle(id: string) {
  await requireUser();
  await deleteBicycleRow(id);
  revalidatePath("/");
  revalidatePath("/bicycles");
  revalidatePath("/services");
}
