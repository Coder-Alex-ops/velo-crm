"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  createUser as createUserRow,
  deleteUser as deleteUserRow,
  findUserByEmail,
  updateUserPassword,
} from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { UserRole } from "@/lib/types";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("Само администратор може да управлява потребители");
  }
  return user;
}

export async function createUser(formData: FormData) {
  const admin = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "mechanic") as UserRole;
  const password = String(formData.get("password") ?? "");

  if (!email) throw new Error("Email е задължителен");
  if (!name) throw new Error("Името е задължително");
  if (password.length < 6) throw new Error("Паролата трябва да е поне 6 символа");
  if (role !== "admin" && role !== "mechanic") {
    throw new Error("Невалидна роля");
  }

  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Потребител с този email вече съществува");

  const passwordHash = await bcrypt.hash(password, 10);
  await createUserRow({ email, passwordHash, name, role, organizationId: admin.organizationId });

  revalidatePath("/users");
  redirect("/users");
}

export async function resetUserPassword(id: string, formData: FormData) {
  await requireAdmin();
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) throw new Error("Паролата трябва да е поне 6 символа");

  const passwordHash = await bcrypt.hash(password, 10);
  await updateUserPassword(id, passwordHash);

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (me.id === id) {
    throw new Error("Не може да изтриете собствения си акаунт");
  }
  await deleteUserRow(id);
  revalidatePath("/users");
}
