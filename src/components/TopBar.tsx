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
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-8 backdrop-blur">
      <div className="text-xs text-gray-500">{status}</div>
      {action && (
        <Link href={action.href} className="btn-primary">
          <Plus className="h-4 w-4" />
          {action.label}
        </Link>
      )}
    </div>
  );
}
