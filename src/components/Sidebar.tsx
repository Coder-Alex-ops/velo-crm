"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike, Gauge, UserCircle, Wrench } from "lucide-react";
import clsx from "clsx";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const nav: NavItem[] = [
  { href: "/", label: "Табло", icon: Gauge },
  { href: "/customers", label: "Клиенти", icon: UserCircle },
  { href: "/bicycles", label: "Велосипеди", icon: Bike },
  { href: "/services", label: "Сервизи", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Bike className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">
          <span className="text-gray-900">Velo</span>
          <span className="text-brand-600">CRM</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-100 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
        Velo CRM · v0.1
      </div>
    </aside>
  );
}
