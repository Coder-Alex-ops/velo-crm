"use client";

import Link from "next/link";
import { Bike } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "./actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
      {pending ? "Регистрация..." : "Създай акаунт"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, null);

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
          <p className="mt-1 text-sm text-gray-500">Регистрирайте вашия сервиз</p>
        </div>

        <div className="card p-6">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                {state.error}
              </div>
            )}
            <div>
              <label className="label">Име на сервиза</label>
              <input
                name="orgName"
                required
                placeholder="напр. Velo Shop Пловдив"
                className="input"
                autoComplete="organization"
              />
            </div>
            <div>
              <label className="label">Вашето име</label>
              <input
                name="name"
                required
                placeholder="Иван Петров"
                className="input"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="ivan@example.com"
                className="input"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Парола</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Поне 6 символа"
                className="input"
                autoComplete="new-password"
              />
            </div>
            <SubmitBtn />
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Вече имате акаунт?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Влезте тук
          </Link>
        </p>
      </div>
    </div>
  );
}
