"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveProfile, generateProfileSummaryAction, generateProfileSkillsAction } from "@/lib/actions/profile";
import type { Profile, ProfileUpdate } from "@/lib/types/database";
import { Plus, X, Sparkles } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { formInputClass, formTextareaClass, formLabelClass } from "@/lib/form-classes";

const emptyExp = () => ({
  title: "",
  company: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});
const emptyEdu = () => ({
  institution: "",
  degree: "",
  startDate: "",
  endDate: "",
  description: "",
});
const emptyCert = () => ({ name: "", issuer: "", date: "", url: "" });
const emptyProj = () => ({ name: "", url: "", description: "", tech: "" });
const emptyLang = () => ({ language: "", level: "" });

const inputClass = formInputClass;
const textareaClass = formTextareaClass;
const labelClass = formLabelClass;
const sectionClass = "text-sm font-semibold uppercase tracking-wider text-slate-500";

function ensureArray<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : [];
}

export function ProfileForm({
  profile,
  userEmail,
  onSuccessRedirect,
  submitLabel = "Save",
}: {
  profile: Profile | null;
  userEmail?: string | null;
  onSuccessRedirect: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? userEmail ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [summary, setSummary] = useState(profile?.summary ?? "");
  const [experience, setExperience] = useState(() =>
    ensureArray(profile?.experience).length ? ensureArray(profile?.experience) : [emptyExp()]
  );
  const [education, setEducation] = useState(() =>
    ensureArray(profile?.education).length ? ensureArray(profile?.education) : [emptyEdu()]
  );
  const [certifications, setCertifications] = useState(() =>
    ensureArray(profile?.certifications).length ? ensureArray(profile?.certifications) : [emptyCert()]
  );
  const [projects, setProjects] = useState(() =>
    ensureArray(profile?.projects).length ? ensureArray(profile?.projects) : [emptyProj()]
  );
  const [languages, setLanguages] = useState(() =>
    ensureArray(profile?.languages).length ? ensureArray(profile?.languages) : [emptyLang()]
  );
  const [skills, setSkills] = useState(() =>
    ensureArray(profile?.skills).length
      ? ensureArray(profile?.skills).map((s) => s?.name ?? "")
      : [""]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [generatingSkills, setGeneratingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const updateExp = useCallback((i: number, field: string, value: string | boolean) => {
    setExperience((prev) => {
      const next = [...prev];
      next[i] = { ...(next[i] ?? emptyExp()), [field]: value };
      return next;
    });
  }, []);
  const addExp = useCallback(() => setExperience((p) => [...p, emptyExp()]), []);
  const removeExp = useCallback((i: number) => {
    setExperience((p) => (p.length <= 1 ? [emptyExp()] : p.filter((_, j) => j !== i)));
  }, []);
  const updateEdu = useCallback((i: number, field: string, value: string) => {
    setEducation((prev) => {
      const next = [...prev];
      next[i] = { ...(next[i] ?? emptyEdu()), [field]: value };
      return next;
    });
  }, []);
  const addEdu = useCallback(() => setEducation((p) => [...p, emptyEdu()]), []);
  const removeEdu = useCallback((i: number) => {
    setEducation((p) => (p.length <= 1 ? [emptyEdu()] : p.filter((_, j) => j !== i)));
  }, []);
  const updateCert = useCallback((i: number, field: string, value: string) => {
    setCertifications((prev) => {
      const next = [...prev];
      next[i] = { ...(next[i] ?? emptyCert()), [field]: value };
      return next;
    });
  }, []);
  const addCert = useCallback(() => setCertifications((p) => [...p, emptyCert()]), []);
  const removeCert = useCallback((i: number) => {
    setCertifications((p) => (p.length <= 1 ? [emptyCert()] : p.filter((_, j) => j !== i)));
  }, []);
  const updateProj = useCallback((i: number, field: string, value: string) => {
    setProjects((prev) => {
      const next = [...prev];
      next[i] = { ...(next[i] ?? emptyProj()), [field]: value };
      return next;
    });
  }, []);
  const addProj = useCallback(() => setProjects((p) => [...p, emptyProj()]), []);
  const removeProj = useCallback((i: number) => {
    setProjects((p) => (p.length <= 1 ? [emptyProj()] : p.filter((_, j) => j !== i)));
  }, []);
  const updateLang = useCallback((i: number, field: string, value: string) => {
    setLanguages((prev) => {
      const next = [...prev];
      next[i] = { ...(next[i] ?? emptyLang()), [field]: value };
      return next;
    });
  }, []);
  const addLang = useCallback(() => setLanguages((p) => [...p, emptyLang()]), []);
  const removeLang = useCallback((i: number) => {
    setLanguages((p) => (p.length <= 1 ? [emptyLang()] : p.filter((_, j) => j !== i)));
  }, []);
  const setSkill = useCallback((i: number, value: string) => {
    setSkills((p) => {
      const next = [...p];
      next[i] = value;
      return next;
    });
  }, []);
  const addSkill = useCallback(() => setSkills((p) => [...p, ""]), []);
  const removeSkill = useCallback((i: number) => {
    setSkills((p) => (p.length <= 1 ? [""] : p.filter((_, j) => j !== i)));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload: ProfileUpdate = {
      full_name: fullName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      location: location.trim() || null,
      summary: summary.trim() || null,
      experience: experience.map((e) => ({
        title: e.title?.trim(),
        company: e.company?.trim(),
        startDate: e.startDate?.trim(),
        endDate: e.endDate?.trim(),
        current: e.current,
        description: e.description?.trim(),
      })),
      education: education.map((e) => ({
        institution: e.institution?.trim(),
        degree: e.degree?.trim(),
        startDate: e.startDate?.trim(),
        endDate: e.endDate?.trim(),
        description: e.description?.trim(),
      })),
      certifications: certifications.map((c) => ({
        name: c.name?.trim(),
        issuer: c.issuer?.trim(),
        date: c.date?.trim(),
        url: c.url?.trim(),
      })),
      projects: projects.map((p) => ({
        name: p.name?.trim(),
        url: p.url?.trim(),
        description: p.description?.trim(),
        tech: p.tech?.trim(),
      })),
      languages: languages.map((l) => ({
        language: l.language?.trim(),
        level: l.level?.trim(),
      })),
      skills: skills
        .map((s) => s?.trim())
        .filter(Boolean)
        .map((name) => ({ name, category: "" })),
    };
    const result = await saveProfile(payload);
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(onSuccessRedirect);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <ErrorBanner message={error} />
      )}

      <div className="space-y-4">
        <h2 className={sectionClass}>Basic info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="full_name">
              Full name
            </label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="Your phone number"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="City, Country"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className={labelClass} htmlFor="summary">
              Professional summary
            </label>
            {(!summary.trim() || generatingSummary) && (
              <button
                type="button"
                disabled={generatingSummary || !experience.some((e) => (e?.title?.trim() || e?.company?.trim() || e?.description?.trim()))}
                onClick={async () => {
                  setGeneratingSummary(true);
                  setSummaryError(null);
                  const result = await generateProfileSummaryAction({
                    experience,
                    education,
                    skills: skills.filter(Boolean).map((name) => ({ name: name.trim(), category: "" })),
                  });
                  setGeneratingSummary(false);
                  if (result.summary != null) setSummary(result.summary);
                  else if (result.error) setSummaryError(result.error);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {generatingSummary ? "Generating…" : "Generate from experience"}
              </button>
            )}
          </div>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={textareaClass}
            placeholder="Brief overview of your background and goals. Add experience above, then use “Generate from experience” to create one."
            rows={3}
          />
          {summaryError && (
            <p className="mt-1.5 text-sm text-destructive" role="alert">{summaryError}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionClass}>Experience</h2>
          <button type="button" onClick={addExp} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-6 border-l-2 border-slate-100 pl-4">
          {experience.map((exp, i) => (
            <div key={i} className="relative space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Job title</label>
                  <input
                    type="text"
                    value={exp.title ?? ""}
                    onChange={(e) => updateExp(i, "title", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input
                    type="text"
                    value={exp.company ?? ""}
                    onChange={(e) => updateExp(i, "company", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Start</label>
                  <input
                    type="text"
                    value={exp.startDate ?? ""}
                    onChange={(e) => updateExp(i, "startDate", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Jan 2021"
                  />
                </div>
                <div>
                  <label className={labelClass}>End</label>
                  <input
                    type="text"
                    value={exp.current ? "Present" : (exp.endDate ?? "")}
                    onChange={(e) => {
                      const v = e.target.value;
                      const isPresent = /present|current|now/i.test(v);
                      updateExp(i, "current", isPresent);
                      updateExp(i, "endDate", isPresent ? "" : v);
                    }}
                    className={inputClass}
                    placeholder="Present"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={exp.description ?? ""}
                    onChange={(e) => updateExp(i, "description", e.target.value)}
                    className={textareaClass}
                    rows={2}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExp(i)}
                className="absolute -left-4 top-0 rounded-full bg-white p-1 text-slate-400 hover:text-red-500"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionClass}>Education</h2>
          <button type="button" onClick={addEdu} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {education.map((ed, i) => (
            <div key={i} className="relative grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Degree</label>
                <input
                  type="text"
                  value={ed.degree ?? ""}
                  onChange={(e) => updateEdu(i, "degree", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Institution</label>
                <input
                  type="text"
                  value={ed.institution ?? ""}
                  onChange={(e) => updateEdu(i, "institution", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Year</label>
                <input
                  type="text"
                  value={ed.endDate ?? ed.startDate ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateEdu(i, "endDate", v);
                    if (!ed.startDate) updateEdu(i, "startDate", v);
                  }}
                  className={inputClass}
                  placeholder="e.g. 2019"
                />
              </div>
              <button
                type="button"
                onClick={() => removeEdu(i)}
                className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-red-500"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionClass}>Certifications</h2>
          <button type="button" onClick={addCert} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {certifications.map((c, i) => (
            <div key={i} className="relative grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={c.name ?? ""}
                  onChange={(e) => updateCert(i, "name", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
              </div>
              <div>
                <label className={labelClass}>Issuer</label>
                <input
                  type="text"
                  value={c.issuer ?? ""}
                  onChange={(e) => updateCert(i, "issuer", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="text"
                  value={c.date ?? ""}
                  onChange={(e) => updateCert(i, "date", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 2023"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>URL (optional)</label>
                <input
                  type="url"
                  value={c.url ?? ""}
                  onChange={(e) => updateCert(i, "url", e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <button
                type="button"
                onClick={() => removeCert(i)}
                className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-red-500"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionClass}>Projects</h2>
          <button type="button" onClick={addProj} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {projects.map((p, i) => (
            <div key={i} className="relative grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={p.name ?? ""}
                  onChange={(e) => updateProj(i, "name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>URL (optional)</label>
                <input
                  type="url"
                  value={p.url ?? ""}
                  onChange={(e) => updateProj(i, "url", e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  value={p.description ?? ""}
                  onChange={(e) => updateProj(i, "description", e.target.value)}
                  className={textareaClass}
                  rows={2}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Technologies (optional)</label>
                <input
                  type="text"
                  value={p.tech ?? ""}
                  onChange={(e) => updateProj(i, "tech", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. React, Node.js"
                />
              </div>
              <button
                type="button"
                onClick={() => removeProj(i)}
                className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-red-500"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionClass}>Languages</h2>
          <button type="button" onClick={addLang} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {languages.map((l, i) => (
            <div key={i} className="relative grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Language</label>
                <input
                  type="text"
                  value={l.language ?? ""}
                  onChange={(e) => updateLang(i, "language", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. English"
                />
              </div>
              <div>
                <label className={labelClass}>Level</label>
                <input
                  type="text"
                  value={l.level ?? ""}
                  onChange={(e) => updateLang(i, "level", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Native, Fluent, B2"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLang(i)}
                className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-red-500"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className={sectionClass}>Skills</h2>
          <div className="flex items-center gap-2">
            {(skills.length <= 1 && !skills[0]?.trim()) || generatingSkills ? (
              <button
                type="button"
                disabled={generatingSkills || !experience.some((e) => (e?.title?.trim() || e?.company?.trim() || e?.description?.trim()))}
                onClick={async () => {
                  setGeneratingSkills(true);
                  setSkillsError(null);
                  const result = await generateProfileSkillsAction({
                    experience,
                    education,
                    skills: skills.filter(Boolean).map((name) => ({ name: name.trim(), category: "" })),
                  });
                  setGeneratingSkills(false);
                  if (result.skills != null && result.skills.length > 0) setSkills(result.skills);
                  else if (result.error) setSkillsError(result.error);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {generatingSkills ? "Generating…" : "Generate from experience"}
              </button>
            ) : null}
            <button type="button" onClick={addSkill} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
        {skillsError && (
          <p className="text-sm text-destructive" role="alert">{skillsError}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <div key={i} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <input
                type="text"
                value={s}
                onChange={(e) => setSkill(i, e.target.value)}
                className="w-24 min-w-0 border-none bg-transparent p-0 text-sm focus:ring-0"
                placeholder="Skill"
              />
              <button type="button" onClick={() => removeSkill(i)} className="text-slate-400 hover:text-red-500" aria-label="Remove">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="h-10 rounded-md bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
