"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bike, Gauge, Menu, Package, UserCircle, Users, Wrench, X } from "lucide-react";
import clsx from "clsx";
import { LogoutButton } from "./LogoutButton";
import type { UserRole } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const nav: NavItem[] = [
  { href: "/", label: "Табло", icon: Gauge },
  { href: "/customers", label: "Клиенти", icon: UserCircle },
  { href: "/bicycles", label: "Велосипеди", icon: Bike },
  { href: "/services", label: "Сервизи", icon: Wrench },
  { href: "/inventory", label: "Склад", icon: Package },
  { href: "/users", label: "Потребители", icon: Users, adminOnly: true },
];

export function Sidebar({
  user,
  organizationName,
}: {
  user: { name: string; email: string; role: UserRole };
  organizationName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const visibleNav = nav.filter(
    (item) => !item.adminOnly || user.role === "admin",
  );

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-900 text-zinc-400 shadow-md lg:hidden"
        aria-label="Отвори меню"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-surface-950 transition-transform duration-200",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-surface-800">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Bike className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Velo<span className="text-brand-400">CRM</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-300 lg:hidden"
            aria-label="Затвори меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Org name */}
        {organizationName && (
          <div className="px-5 pt-4 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              {organizationName}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-surface-800 text-white"
                      : "text-zinc-400 hover:bg-surface-900 hover:text-zinc-200",
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-4 w-4 shrink-0",
                      active ? "text-brand-400" : "text-zinc-500",
                    )}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-surface-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">
                {user.name}
              </div>
              <div className="truncate text-xs text-zinc-500">
                {user.role === "admin" ? "Администратор" : "Механик"}
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
