"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCustomerRow,
  deleteCustomerRow,
  updateCustomerRow,
} from "@/lib/db";
import { requireUser } from "@/lib/session";

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
  const user = await requireUser();
  const data = readBase(formData);
  const created = await createCustomerRow({ ...data, organizationId: user.organizationId });

  revalidatePath("/");
  revalidatePath("/customers");
  redirect(`/customers/${created.id}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const user = await requireUser();
  const data = readBase(formData);
  await updateCustomerRow(user.organizationId, id, data);

  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  const user = await requireUser();
  await deleteCustomerRow(user.organizationId, id);
  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath("/bicycles");
  revalidatePath("/services");
}
