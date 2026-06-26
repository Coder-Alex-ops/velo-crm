"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBicycleRow,
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

  const bikeBrand = String(formData.get("bike_brand") ?? "").trim();
  const bikeModel = String(formData.get("bike_model") ?? "").trim();
  if (bikeBrand && bikeModel) {
    const year = Number(formData.get("bike_year")) || undefined;
    await createBicycleRow({
      organizationId: user.organizationId,
      customerId: created.id,
      brand: bikeBrand,
      model: bikeModel,
      year: Number.isFinite(year) ? year : undefined,
      type: String(formData.get("bike_type") ?? "").trim() || undefined,
      color: String(formData.get("bike_color") ?? "").trim() || undefined,
      serialNumber: String(formData.get("bike_serial") ?? "").trim() || undefined,
      frameSize: String(formData.get("bike_frameSize") ?? "").trim() || undefined,
      wheelSize: String(formData.get("bike_wheelSize") ?? "").trim() || undefined,
    });
    revalidatePath("/bicycles");
  }

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
