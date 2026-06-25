import { redirect } from "next/navigation";
import { Plus, Shield, User as UserIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { listUsers } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { createUser, resetUserPassword } from "./actions";
import { DeleteUserButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireUser();
  if (me.role !== "admin") redirect("/");

  const users = await listUsers();

  return (
    <>
      <TopBar status="Потребители" />
      <div className="page-container">
        <PageHeader
          title="Потребители"
          subtitle="Управление на хора с достъп до системата"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card overflow-x-auto lg:col-span-2">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Потребител</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Роля</th>
                  <th className="px-6 py-3">Създаден</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {u.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {u.name}
                          {u.id === me.id && (
                            <span className="ml-2 text-xs font-normal text-gray-400">
                              (ти)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          u.role === "admin"
                            ? "badge bg-brand-100 text-brand-700"
                            : "badge bg-gray-100 text-gray-700"
                        }
                      >
                        {u.role === "admin" ? (
                          <Shield className="mr-1 inline h-3 w-3" />
                        ) : (
                          <UserIcon className="mr-1 inline h-3 w-3" />
                        )}
                        {u.role === "admin" ? "Администратор" : "Механик"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <details className="relative">
                          <summary className="cursor-pointer rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                            Нова парола
                          </summary>
                          <div className="absolute right-0 z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-card">
                            <form
                              action={resetUserPassword.bind(null, u.id)}
                              className="space-y-2"
                            >
                              <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Нова парола"
                                className="input"
                              />
                              <SubmitButton
                                className="btn-primary w-full text-xs"
                                pendingLabel="..."
                              >
                                Запази
                              </SubmitButton>
                            </form>
                          </div>
                        </details>
                        <DeleteUserButton id={u.id} disabled={u.id === me.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Plus className="h-4 w-4 text-gray-500" />
              Нов потребител
            </h3>
            <form action={createUser} className="space-y-3">
              <div>
                <label className="label">Име</label>
                <input
                  name="name"
                  required
                  placeholder="Иван Петров"
                  className="input"
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
                />
              </div>
              <div>
                <label className="label">Роля</label>
                <select name="role" defaultValue="mechanic" className="input">
                  <option value="mechanic">Механик</option>
                  <option value="admin">Администратор</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Администраторите виждат всички страници, включително
                  потребителите.
                </p>
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
                />
              </div>
              <SubmitButton className="btn-primary w-full">
                Създай потребител
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
