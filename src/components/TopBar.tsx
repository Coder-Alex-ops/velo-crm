import Link from "next/link";
import { Plus } from "lucide-react";

export function TopBar({
  status,
  action,
}: {
  status?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-zinc-200 bg-stone-50/90 pl-16 pr-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="truncate text-xs font-medium text-zinc-400 sm:text-sm">{status}</div>
      {action && (
        <Link
          href={action.href}
          className="btn-primary shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{action.label}</span>
          <span className="sm:hidden">Добави</span>
        </Link>
      )}
    </div>
  );
}
