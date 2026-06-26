"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createOrganization, createUser, findUserByEmail } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function registerAction(_prev: unknown, formData: FormData) {
  const orgName = String(formData.get("orgName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!orgName) return { error: "Въведете името на сервиза" };
  if (!name) return { error: "Въведете вашето име" };
  if (!email) return { error: "Въведете email адрес" };
  if (password.length < 6) return { error: "Паролата трябва да е поне 6 символа" };

  const existing = await findUserByEmail(email);
  if (existing) return { error: "Потребител с този email вече съществува" };

  const org = await createOrganization(orgName);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    organizationId: org.id,
    email,
    passwordHash,
    name,
    role: "admin",
  });

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.role = user.role;
  session.organizationId = org.id;
  session.organizationName = org.name;
  await session.save();

  redirect("/");
}
