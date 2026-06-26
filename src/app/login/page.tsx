import Link from "next/link";
import { redirect } from "next/navigation";
import { Bike, Wrench, Package } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen">
      {/* Dark left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-surface-950 p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Velo<span className="text-brand-400">CRM</span>
            </span>
          </div>

          <div className="mt-16">
            <h2 className="text-4xl font-bold leading-tight text-white">
              Управлявайте<br />
              сервиза си<br />
              <span className="text-brand-400">без усилие</span>
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              Клиенти, велосипеди, поръчки и склад — всичко на едно място.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              { icon: Wrench, text: "Проследявайте всеки сервизен запис" },
              { icon: Bike, text: "История по клиент и велосипед" },
              { icon: Package, text: "Контрол на склада в реално време" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-800">
                  <Icon className="h-4 w-4 text-brand-400" />
                </div>
                <span className="text-sm text-zinc-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-600">Velo CRM · v0.2</p>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-stone-50 px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
            <Bike className="h-6 w-6 text-white" />
          </div>
          <span className="mt-3 text-2xl font-bold text-zinc-900">
            Velo<span className="text-brand-500">CRM</span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Добре дошли</h1>
            <p className="mt-1 text-sm text-zinc-500">Влезте в акаунта си</p>
          </div>

          <div className="card p-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Нямате акаунт?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Регистрирайте се
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
