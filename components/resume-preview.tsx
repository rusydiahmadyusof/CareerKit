import type { ResumeContent, ResumeBasicInfo } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { Mail, Globe, Phone } from "lucide-react";

const TEMPLATES = ["default", "minimal"] as const;
export type ResumeTemplateId = (typeof TEMPLATES)[number];

/** A4-friendly: compact spacing and typography for print/screen preview. */
const SECTION_HEADING =
  "text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-1.5";
const A4_WRAPPER = "w-full max-w-[210mm] mx-auto";
const A4_PADDING = "px-[12mm] py-[10mm]";

export function ResumePreview({
  content,
  templateId = "default",
  className,
  forPrint,
  resumeName,
  basicInfo,
}: {
  content: ResumeContent;
  templateId?: string;
  className?: string;
  forPrint?: boolean;
  resumeName?: string;
  basicInfo?: ResumeBasicInfo;
}) {
  const template = TEMPLATES.includes(templateId as ResumeTemplateId)
    ? (templateId as ResumeTemplateId)
    : "default";

  if (template === "minimal") {
    return (
      <MinimalTemplate content={content} className={className} forPrint={forPrint} />
    );
  }
  return (
    <DefaultTemplate
      content={content}
      className={className}
      forPrint={forPrint}
      resumeName={resumeName}
      basicInfo={basicInfo}
    />
  );
}

function DefaultTemplate({
  content,
  className,
  forPrint,
  resumeName,
  basicInfo,
}: {
  content: ResumeContent;
  className?: string;
  forPrint?: boolean;
  resumeName?: string;
  basicInfo?: ResumeBasicInfo;
}) {
  const info = basicInfo ?? content.basicInfo;
  const hasHeader = info?.fullName ?? info?.jobTitle ?? info?.email ?? info?.phone ?? info?.website ?? info?.location ?? info?.linkedIn ?? resumeName;

  const articleClass = cn(
    "flex flex-col text-slate-900 bg-white",
    A4_WRAPPER,
    A4_PADDING,
    forPrint && "border-0 shadow-none print:block",
    !forPrint && "rounded-lg border border-slate-200 shadow-sm",
    className
  );

  return (
    <article className={articleClass}>
      {hasHeader && (
        <div className="border-b border-slate-700 pb-2 mb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {info?.fullName ?? resumeName ?? "Resume"}
          </h1>
          {info?.jobTitle && (
            <p className="text-sm font-medium text-slate-600 mt-0.5">{info.jobTitle}</p>
          )}
          {(info?.email ?? info?.phone ?? info?.website ?? info?.location ?? info?.linkedIn) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-slate-500">
              {info.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3 shrink-0" aria-hidden />
                  {info.email}
                </span>
              )}
              {info.email && info.phone && <span>·</span>}
              {info.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 shrink-0" aria-hidden />
                  {info.phone}
                </span>
              )}
              {(info.email || info.phone) && info.website && <span>·</span>}
              {info.website && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 shrink-0" aria-hidden />
                  {info.website}
                </span>
              )}
              {(info.email || info.phone || info.website) && info.location && <span>·</span>}
              {info.location && <span>{info.location}</span>}
              {(info.email || info.phone || info.website || info.location) && info.linkedIn && <span>·</span>}
              {info.linkedIn && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 shrink-0" aria-hidden />
                  LinkedIn
                </span>
              )}
            </div>
          )}
        </div>
      )}
      <div className={cn("space-y-4", !hasHeader && "pt-0")}>
        {content.summary && (
          <section>
            <h2 className={SECTION_HEADING}>Professional Summary</h2>
            <p className="text-slate-700 leading-snug text-[11px] whitespace-pre-wrap">
              {content.summary}
            </p>
          </section>
        )}
        {(content.experience?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Experience</h2>
            <div className="space-y-3">
              {content.experience!.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-slate-900 text-[11px]">{exp.title ?? "Role"}</h3>
                    <span className="text-[10px] font-medium text-slate-500 shrink-0">
                      {exp.startDate ?? "—"} – {exp.current ? "Present" : exp.endDate ?? "—"}
                    </span>
                  </div>
                  {exp.company && (
                    <p className="text-[11px] font-medium text-slate-600 mb-0.5">{exp.company}</p>
                  )}
                  {exp.description && (() => {
                    const lines = exp.description
                      .split(/\n+/)
                      .map((l) => l.trim())
                      .filter(Boolean);
                    return lines.length > 0 ? (
                      <ul className="text-[11px] text-slate-700 list-disc ml-3.5 space-y-0.5">
                        {lines.map((line, j) => (
                          <li key={j}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-slate-700 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    );
                  })()}
                </div>
              ))}
            </div>
          </section>
        )}
        {(content.education?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Education</h2>
            <div className="space-y-2">
              {content.education!.map((ed, i) => (
                <div key={i} className="flex justify-between items-baseline gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-[11px]">{ed.degree ?? "Degree"}</h3>
                    <p className="text-[11px] text-slate-600">{ed.institution ?? "Institution"}</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 shrink-0">
                    {ed.endDate ? `Graduated ${ed.endDate}` : ed.startDate ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        {(content.certifications?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Certifications</h2>
            <div className="space-y-1.5">
              {content.certifications!.map((c, i) => (
                <div key={i} className="flex justify-between items-baseline gap-2">
                  <span className="font-medium text-slate-900 text-[11px]">{c.name ?? "Certification"}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">{c.issuer ?? ""} {c.date ? ` · ${c.date}` : ""}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        {(content.projects?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Projects</h2>
            <div className="space-y-2">
              {content.projects!.map((p, i) => (
                <div key={i}>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold text-slate-900 text-[11px]">{p.name ?? "Project"}</h3>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline shrink-0">Link</a>
                    )}
                  </div>
                  {p.description && <p className="text-[11px] text-slate-700 mt-0.5">{p.description}</p>}
                  {p.tech && <p className="text-[10px] text-slate-500 mt-0.5">{p.tech}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
        {(content.languages?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-1.5")}>Languages</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {content.languages!.map((l, i) => (
                <span key={i} className="text-[11px] text-slate-700">
                  {l.language ?? ""}{l.level ? ` (${l.level})` : ""}
                </span>
              ))}
            </div>
          </section>
        )}
        {(content.skills?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-1.5")}>Skills</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {content.skills!.map((s, i) => (
                <span key={i} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden />
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function MinimalTemplate({
  content,
  className,
  forPrint,
}: {
  content: ResumeContent;
  className?: string;
  forPrint?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex flex-col bg-white text-neutral-800",
        A4_WRAPPER,
        A4_PADDING,
        forPrint && "print:block border-0 shadow-none",
        !forPrint && "rounded-lg ring-1 ring-neutral-200",
        className
      )}
    >
      <div className="space-y-4">
        {content.summary && (
          <section>
            <h2 className={SECTION_HEADING}>Summary</h2>
            <p className="whitespace-pre-wrap text-[11px] leading-snug text-neutral-700">
              {content.summary}
            </p>
          </section>
        )}
        {(content.experience?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Experience</h2>
            <ul className="space-y-2">
              {content.experience!.map((exp, i) => (
                <li key={i} className="border-l-2 border-neutral-200 pl-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold text-[11px]">{exp.title ?? "Role"}</span>
                    <span className="text-[10px] text-neutral-500">
                      {exp.startDate ?? "—"} – {exp.current ? "Present" : exp.endDate ?? "—"}
                    </span>
                  </div>
                  {exp.company && (
                    <p className="text-[11px] text-neutral-600">{exp.company}</p>
                  )}
                  {exp.description && (
                    <p className="mt-0.5 whitespace-pre-wrap text-[11px] text-neutral-700 leading-snug">
                      {exp.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {(content.education?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Education</h2>
            <ul className="space-y-1.5 text-[11px]">
              {content.education!.map((ed, i) => (
                <li key={i}>
                  <span className="font-semibold">{ed.institution ?? "Institution"}</span>
                  {ed.degree && <span> · {ed.degree}</span>}
                  {(ed.startDate || ed.endDate) && (
                    <span className="text-neutral-500">
                      {" "}
                      {ed.startDate ?? "—"} – {ed.endDate ?? "—"}
                    </span>
                  )}
                  {ed.description && (
                    <p className="mt-0.5 text-neutral-600">{ed.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {(content.certifications?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Certifications</h2>
            <ul className="space-y-1 text-[11px]">
              {content.certifications!.map((c, i) => (
                <li key={i}>
                  <span className="font-semibold">{c.name ?? "Certification"}</span>
                  {(c.issuer || c.date) && (
                    <span className="text-neutral-500"> · {[c.issuer, c.date].filter(Boolean).join(" ")}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {(content.projects?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-2")}>Projects</h2>
            <ul className="space-y-1.5 text-[11px]">
              {content.projects!.map((p, i) => (
                <li key={i}>
                  <span className="font-semibold">{p.name ?? "Project"}</span>
                  {p.description && <span className="text-neutral-700"> — {p.description}</span>}
                  {p.tech && <span className="text-neutral-500"> ({p.tech})</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {(content.languages?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-1.5")}>Languages</h2>
            <p className="text-[11px]">
              {content.languages!
                .map((l) => (l.level ? `${l.language} (${l.level})` : l.language))
                .filter(Boolean)
                .join(" · ")}
            </p>
          </section>
        )}
        {(content.skills?.length ?? 0) > 0 && (
          <section>
            <h2 className={cn(SECTION_HEADING, "mb-1.5")}>Skills</h2>
            <p className="text-[11px]">
              {content.skills!
                .map((s) => (s.category ? `${s.name} (${s.category})` : s.name))
                .join(" · ")}
            </p>
          </section>
        )}
      </div>
    </article>
  );
}
