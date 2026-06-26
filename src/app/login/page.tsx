import Link from "next/link";
import { redirect } from "next/navigation";
import { Bike } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Bike className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            <span className="text-gray-900">Velo</span>
            <span className="text-brand-600">CRM</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Влез в системата на сервиза
          </p>
        </div>

        <div className="card p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Нямате акаунт?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Регистрирайте се
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-gray-400">
          Velo CRM · v0.2
        </p>
      </div>
    </div>
  );
}
