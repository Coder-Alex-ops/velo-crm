"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { findUserByEmail, getOrganization } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Моля въведете email и парола" };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "Невалиден email или парола" };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "Невалиден email или парола" };
  }

  const org = await getOrganization(user.organizationId);

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.role = user.role;
  session.organizationId = user.organizationId;
  session.organizationName = org?.name ?? "";
  await session.save();

  redirect("/");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
