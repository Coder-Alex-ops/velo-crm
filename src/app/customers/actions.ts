"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newId, updateDb } from "@/lib/db";

function readBase(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "");

  if (!firstName) throw new Error("Името е задължително");
  if (!lastName) throw new Error("Фамилията е задължителна");

  return {
    firstName,
    lastName,
    phone: phone || undefined,
    email: email || undefined,
    address: address || undefined,
    city: city || undefined,
    notes: notes || undefined,
  };
}

export async function createCustomer(formData: FormData) {
  const data = readBase(formData);
  const now = new Date().toISOString();
  const id = newId("cust");

  await updateDb(async (db) => {
    db.customers.push({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  });

  revalidatePath("/");
  revalidatePath("/customers");
  redirect(`/customers/${id}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const data = readBase(formData);

  await updateDb(async (db) => {
    const c = db.customers.find((c) => c.id === id);
    if (!c) throw new Error("Клиентът не е намерен");
    Object.assign(c, data, { updatedAt: new Date().toISOString() });
  });

  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  await updateDb(async (db) => {
    db.customers = db.customers.filter((c) => c.id !== id);
    const bikeIds = db.bicycles
      .filter((b) => b.customerId === id)
      .map((b) => b.id);
    db.bicycles = db.bicycles.filter((b) => b.customerId !== id);
    db.serviceRecords = db.serviceRecords.filter(
      (s) => s.customerId !== id && !bikeIds.includes(s.bicycleId),
    );
  });
  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath("/bicycles");
  revalidatePath("/services");
}
