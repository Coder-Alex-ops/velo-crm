import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

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
  const tones: Record<string, string> = {
    brand: "bg-brand-100 text-brand-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  const inner = (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </div>
        <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
        {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
      </div>
      <div
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          tones[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="card block p-5 hover:shadow-md transition-shadow">
        {inner}
      </Link>
    );
  }

  return <div className="card p-5">{inner}</div>;
}
