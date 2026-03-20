"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Briefcase, User, LogOut } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function DashboardLayout({ children, userEmail }: { children: React.ReactNode; userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <aside className="sidebar-fixed fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-slate-200 bg-white p-6">
        <div className="mb-8 flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" aria-hidden />
            <span className="text-xl font-bold tracking-tight text-slate-900">CareerKit</span>
          </Link>
        </div>
        <nav className="flex-grow space-y-2" aria-label="Main">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative z-10 flex h-10 items-center gap-3 rounded-md px-3 font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-slate-100 text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 pt-6">
          {userEmail && (
            <p className="mb-2 truncate px-3 text-xs text-slate-500" title={userEmail}>
              {userEmail}
            </p>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label="Log out"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="main-wrapper min-h-screen pl-[240px]">
        <div className="content-container mx-auto max-w-[1280px] p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
