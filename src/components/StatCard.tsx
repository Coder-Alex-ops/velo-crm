import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

const toneClasses: Record<string, { icon: string; bar: string }> = {
  brand: { icon: "text-brand-500", bar: "bg-brand-500" },
  amber: { icon: "text-amber-500", bar: "bg-amber-500" },
  blue: { icon: "text-blue-500", bar: "bg-blue-500" },
  green: { icon: "text-emerald-500", bar: "bg-emerald-500" },
  red: { icon: "text-red-500", bar: "bg-red-500" },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "brand" | "amber" | "blue" | "green" | "red";
  href?: string;
}) {
  const t = toneClasses[tone];

  const inner = (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className={clsx("absolute left-0 top-0 h-full w-1 rounded-l-xl", t.bar)} />
      <div className="flex items-start justify-between pl-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 leading-none">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>
          )}
        </div>
        <div className={clsx("shrink-0 ml-3", t.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{inner}</Link>;
  }

  return inner;
}
