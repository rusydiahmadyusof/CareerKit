import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  "aria-label"?: string;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  "aria-label": ariaLabel,
  className = "",
}: EmptyStateProps) {
  return (
    <section
      className={"flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center " + className}
      data-purpose="empty-state"
      aria-label={ariaLabel}
    >
      <div className="mb-4 rounded-full bg-slate-50 p-4 [&>svg]:text-slate-300" aria-hidden>
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-1 mb-6 max-w-sm text-sm text-slate-500">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {primaryAction}
        {secondaryAction}
      </div>
    </section>
  );
}
