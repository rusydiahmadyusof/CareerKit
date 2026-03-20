import { DashboardLayout } from "@/components/dashboard-layout";
import { requireAuth } from "@/lib/auth/requireAuth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  return <DashboardLayout userEmail={user.email}>{children}</DashboardLayout>;
}
