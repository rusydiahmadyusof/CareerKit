import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RecentActivityItem = {
  id: string;
  href: string;
  title: ReactNode;
  time: string;
  icon: ReactNode;
};

export function RecentActivityList({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {items.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          No recent activity
        </div>
      ) : (
        items.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex h-12 items-center justify-between border-slate-50 px-6 transition-colors hover:bg-slate-50",
              index < items.length - 1 && "border-b",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{item.icon}</span>
              <span className="text-sm">{item.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </Link>
        ))
      )}
    </div>
  );
}

