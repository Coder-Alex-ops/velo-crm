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
    <div className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white/80 pl-16 pr-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="truncate text-xs text-gray-500 sm:text-sm">{status}</div>
      {action && (
        <Link
          href={action.href}
          className="btn-primary shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{action.label}</span>
          <span className="sm:hidden">Добави</span>
        </Link>
      )}
    </div>
  );
}
