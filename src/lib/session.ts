import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import type { UserRole } from "./types";

export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  organizationId?: string;
  organizationName?: string;
};

function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET environment variable must be set to a string of at least 32 characters.",
    );
  }
  return {
    password,
    cookieName: "velo_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(cookies(), getSessionOptions());
}

export async function requireUser() {
  const session = await getSession();
  if (!session.userId || !session.organizationId) {
    throw new Error("Unauthorized");
  }
  return {
    id: session.userId,
    email: session.email!,
    name: session.name!,
    role: session.role!,
    organizationId: session.organizationId,
    organizationName: session.organizationName ?? "",
  };
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId || !session.organizationId) return null;
  return {
    id: session.userId,
    email: session.email!,
    name: session.name!,
    role: session.role!,
    organizationId: session.organizationId,
    organizationName: session.organizationName ?? "",
  };
}
