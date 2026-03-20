import { errorBannerClass } from "@/lib/form-classes";

type ErrorBannerProps = { title?: string; message: string; role?: "alert" | "status" };

export function ErrorBanner({ title, message, role = "alert" }: ErrorBannerProps) {
  return (
    <div className={errorBannerClass} role={role}>
      {title && <p className="font-medium">{title}</p>}
      <p className={title ? "mt-1" : undefined}>{message}</p>
    </div>
  );
}
