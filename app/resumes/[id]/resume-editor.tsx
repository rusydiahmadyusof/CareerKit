"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResumePreview } from "@/components/resume-preview";
import {
  updateResume,
  regenerateProfessionalSummaryAction,
  regenerateSkillsAction,
  getATSScoreForResume,
  updateResumeAtsScore,
  updateResumeInitialJob,
} from "@/lib/actions/resumes";
import type { Resume, ResumeContent } from "@/lib/types/database";
import {
  emptyExperience,
  emptyEducation,
  emptyCertification,
  emptyProject,
  emptyLanguage,
  ensureContent,
} from "@/lib/empty-resume";
import { formInputClass, formTextareaClass, formLabelClass } from "@/lib/form-classes";
import { Plus, Download, Pencil, X, Sparkles, Gauge } from "lucide-react";

const sectionHeading = "text-sm font-bold uppercase tracking-wider text-slate-400";

export function ResumeEditor({
  resume,
  applicationId,
}: {
  resume: Resume;
  applicationId?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(resume.name ?? "");
  const [templateId, setTemplateId] = useState(resume.template_id ?? "default");
  const [content, setContent] = useState<ResumeContent>(() =>
    ensureContent(resume.content as ResumeContent)
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [regeneratingSummary, setRegeneratingSummary] = useState(false);
  const [regeneratingSkills, setRegeneratingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [atsResult, setAtsResult] = useState<{
    score: number;
    feedback: string;
    aspects?: { keywords: number; experience: number; skills: number };
  } | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const atsInitialRun = useRef(false);
  const [atsJobRole, setAtsJobRole] = useState("");
  const [atsJobDesc, setAtsJobDesc] = useState("");
  const [atsError, setAtsError] = useState<string | null>(null);

  // Run ATS score on load when resume has a stored job (so summary at top shows score)
  useEffect(() => {
    const jobRole = resume.initial_job_title?.trim() ?? "";
    const jobDesc = resume.initial_job_description?.trim() ?? "";
    if (jobDesc.length < 80 || atsInitialRun.current) return;
    atsInitialRun.current = true;
    setAtsLoading(true);
    getATSScoreForResume(resume.id, jobRole || "Role", jobDesc).then((out) => {
      setAtsLoading(false);
      if (!("error" in out)) {
        setAtsResult({
          score: out.score,
          feedback: out.feedback,
          ...(out.aspects && { aspects: out.aspects }),
        });
        updateResumeAtsScore(resume.id, out.score);
      }
    });
  }, [resume.id, resume.initial_job_title, resume.initial_job_description]);

  const handleRefreshAtsScore = useCallback(() => {
    const jobRole = resume.initial_job_title?.trim() ?? "";
    const jobDesc = resume.initial_job_description?.trim() ?? "";
    if (!jobDesc) return;
    setAtsLoading(true);
    getATSScoreForResume(resume.id, jobRole || "Role", jobDesc).then((out) => {
      setAtsLoading(false);
      if (!("error" in out)) {
        setAtsResult({
          score: out.score,
          feedback: out.feedback,
          ...(out.aspects && { aspects: out.aspects }),
        });
        updateResumeAtsScore(resume.id, out.score);
      }
    });
  }, [resume.id, resume.initial_job_title, resume.initial_job_description]);

  const handleGetAtsScoreFromScratch = useCallback(async () => {
    const role = atsJobRole.trim() || "Role";
    const desc = atsJobDesc.trim();
    if (desc.length < 80) return;
    setAtsLoading(true);
    setAtsError(null);
    const out = await getATSScoreForResume(resume.id, role, desc);
    setAtsLoading(false);
    if ("error" in out) {
      setAtsError(out.error);
      return;
    }
    setAtsResult({
      score: out.score,
      feedback: out.feedback,
      ...(out.aspects && { aspects: out.aspects }),
    });
    updateResumeAtsScore(resume.id, out.score);
    await updateResumeInitialJob(resume.id, role, desc);
    router.refresh();
  }, [resume.id, atsJobRole, atsJobDesc, router]);

  const hasStoredJob = (resume.initial_job_description?.trim() ?? "").length >= 80;

  const updateBasicInfo = useCallback((field: keyof NonNullable<ResumeContent["basicInfo"]>, value: string) => {
    setContent((prev) => ({
      ...prev,
      basicInfo: { ...(prev.basicInfo ?? {}), [field]: value },
    }));
  }, []);
  const updateSummary = useCallback((v: string) => {
    setContent((prev) => ({ ...prev, summary: v }));
  }, []);
  const updateExperience = useCallback((index: number, field: string, value: string | boolean) => {
    setContent((prev) => {
      const list = [...(prev.experience ?? [])];
      const item = { ...(list[index] ?? emptyExperience()), [field]: value };
      list[index] = item;
      return { ...prev, experience: list };
    });
  }, []);
  const addExperience = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      experience: [...(prev.experience ?? []), emptyExperience()],
    }));
  }, []);
  const removeExperience = useCallback((index: number) => {
    setContent((prev) => {
      const list = (prev.experience ?? []).filter((_, i) => i !== index);
      return { ...prev, experience: list };
    });
  }, []);
  const updateEducation = useCallback((index: number, field: string, value: string) => {
    setContent((prev) => {
      const list = [...(prev.education ?? [])];
      const item = { ...(list[index] ?? emptyEducation()), [field]: value };
      list[index] = item;
      return { ...prev, education: list };
    });
  }, []);
  const addEducation = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      education: [...(prev.education ?? []), emptyEducation()],
    }));
  }, []);
  const removeEducation = useCallback((index: number) => {
    setContent((prev) => {
      const list = (prev.education ?? []).filter((_, i) => i !== index);
      return { ...prev, education: list };
    });
  }, []);
  const updateCertification = useCallback((index: number, field: string, value: string) => {
    setContent((prev) => {
      const list = [...(prev.certifications ?? [])];
      const item = { ...(list[index] ?? emptyCertification()), [field]: value };
      list[index] = item;
      return { ...prev, certifications: list };
    });
  }, []);
  const addCertification = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      certifications: [...(prev.certifications ?? []), emptyCertification()],
    }));
  }, []);
  const removeCertification = useCallback((index: number) => {
    setContent((prev) => ({
      ...prev,
      certifications: (prev.certifications ?? []).filter((_, i) => i !== index),
    }));
  }, []);
  const updateProject = useCallback((index: number, field: string, value: string) => {
    setContent((prev) => {
      const list = [...(prev.projects ?? [])];
      const item = { ...(list[index] ?? emptyProject()), [field]: value };
      list[index] = item;
      return { ...prev, projects: list };
    });
  }, []);
  const addProject = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      projects: [...(prev.projects ?? []), emptyProject()],
    }));
  }, []);
  const removeProject = useCallback((index: number) => {
    setContent((prev) => ({
      ...prev,
      projects: (prev.projects ?? []).filter((_, i) => i !== index),
    }));
  }, []);
  const updateLanguage = useCallback((index: number, field: string, value: string) => {
    setContent((prev) => {
      const list = [...(prev.languages ?? [])];
      const item = { ...(list[index] ?? emptyLanguage()), [field]: value };
      list[index] = item;
      return { ...prev, languages: list };
    });
  }, []);
  const addLanguage = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      languages: [...(prev.languages ?? []), emptyLanguage()],
    }));
  }, []);
  const removeLanguage = useCallback((index: number) => {
    setContent((prev) => ({
      ...prev,
      languages: (prev.languages ?? []).filter((_, i) => i !== index),
    }));
  }, []);
  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    setContent((prev) => ({
      ...prev,
      skills: [...(prev.skills ?? []), { name: trimmed, category: "" }],
    }));
    setNewSkill("");
  }, [newSkill]);
  const removeSkill = useCallback((index: number) => {
    setContent((prev) => {
      const list = (prev.skills ?? []).filter((_, i) => i !== index);
      return { ...prev, skills: list };
    });
  }, []);
  const replaceSkills = useCallback((skills: Array<{ name?: string; category?: string }>) => {
    setContent((prev) => ({ ...prev, skills }));
  }, []);
  const updateSkillName = useCallback((index: number, value: string) => {
    setContent((prev) => {
      const list = [...(prev.skills ?? [])];
      const item = { ...(list[index] ?? { name: "", category: "" }), name: value };
      list[index] = item;
      return { ...prev, skills: list };
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateResume(
        resume.id,
        { name, template_id: templateId, content },
        applicationId
      );
      if (result?.error) {
        setSaveError(result.error);
      } else if (result?.redirectTo) {
        router.push(result.redirectTo);
      } else {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    window.open(`/resumes/${resume.id}/print?template=${templateId}`, "_blank", "noopener,noreferrer");
  };

  const basicInfo = content.basicInfo ?? {};

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Page Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div data-purpose="header-title-section" className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Resume Name"
              className="min-w-[200px] max-w-full border-none bg-transparent p-0 text-2xl font-bold text-slate-900 focus:ring-0"
            />
            <Pencil className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          </div>
          <p className="mt-1 text-sm text-slate-500">Summary, experience, education, skills</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3" data-purpose="header-actions">
          <Link
            href="/resumes"
            className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Back to list
          </Link>
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Export PDF
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </header>

      {/* Summary: key aspect ratings so user sees what to improve */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Gauge className="h-4 w-4 text-slate-400" aria-hidden />
          <span className="text-sm font-medium text-slate-600">ATS match</span>
          <span className="text-sm font-semibold text-slate-900">
            {atsLoading ? "Scoring…" : atsResult ? `${atsResult.score}/100` : "—"}
          </span>
        </div>
        {hasStoredJob ? (
          <button
            type="button"
            onClick={handleRefreshAtsScore}
            disabled={atsLoading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {atsLoading ? "Scoring…" : "Refresh score"}
          </button>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="text"
              value={atsJobRole}
              onChange={(e) => setAtsJobRole(e.target.value)}
              placeholder="Job title"
              className="h-9 w-40 rounded-md border border-slate-200 px-2 text-sm"
            />
            <textarea
              value={atsJobDesc}
              onChange={(e) => setAtsJobDesc(e.target.value)}
              placeholder="Paste job description (min 80 chars)"
              rows={1}
              className="min-w-[200px] flex-1 max-w-xs rounded-md border border-slate-200 px-2 py-1.5 text-sm resize-y"
            />
            <button
              type="button"
              onClick={handleGetAtsScoreFromScratch}
              disabled={atsLoading || atsJobDesc.trim().length < 80}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {atsLoading ? "Scoring…" : "Get ATS score"}
            </button>
          </div>
        )}
        {atsError && (
          <p className="text-sm text-red-600" role="alert">{atsError}</p>
        )}
        {atsResult?.aspects && !atsLoading && (
          <>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm" title="Keyword overlap with job description">
              <span className="text-sm font-medium text-slate-600">Keywords</span>
              <span className="text-sm font-semibold text-slate-900">{atsResult.aspects.keywords}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm" title="Relevance of work history to the role">
              <span className="text-sm font-medium text-slate-600">Experience</span>
              <span className="text-sm font-semibold text-slate-900">{atsResult.aspects.experience}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm" title="Skills alignment with job requirements">
              <span className="text-sm font-medium text-slate-600">Skills</span>
              <span className="text-sm font-semibold text-slate-900">{atsResult.aspects.skills}</span>
            </div>
          </>
        )}
      </div>

      {saveError && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {saveError}
        </p>
      )}

      {/* Single panel: Edit | Preview tabs */}
      <section
        className="rounded-lg border border-slate-200 bg-white shadow-sm"
        data-purpose="resume-editor-panel"
      >
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "edit"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
            aria-pressed={activeTab === "edit"}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "preview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
            aria-pressed={activeTab === "preview"}
          >
            Preview
          </button>
        </div>

        {activeTab === "preview" ? (
          <div className="p-6 flex justify-center overflow-auto max-h-[calc(100vh-220px)]">
            <div className="w-[210mm] min-h-[297mm] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shrink-0">
              <ResumePreview
                content={content}
                templateId={templateId}
                resumeName={name}
                basicInfo={content.basicInfo}
                className="min-h-[297mm]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-10 p-6" data-purpose="editor-form">
            {/* Basic Information */}
          <div className="space-y-4">
            <h3 className={sectionHeading}>Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={formLabelClass}>Full Name</label>
                <input
                  type="text"
                  value={basicInfo.fullName ?? ""}
                  onChange={(e) => updateBasicInfo("fullName", e.target.value)}
                  className={formInputClass}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className={formLabelClass}>Email</label>
                <input
                  type="email"
                  value={basicInfo.email ?? ""}
                  onChange={(e) => updateBasicInfo("email", e.target.value)}
                  className={formInputClass}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className={formLabelClass}>Phone</label>
                <input
                  type="tel"
                  value={basicInfo.phone ?? ""}
                  onChange={(e) => updateBasicInfo("phone", e.target.value)}
                  className={formInputClass}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className={formLabelClass}>Job Title</label>
                <input
                  type="text"
                  value={basicInfo.jobTitle ?? ""}
                  onChange={(e) => updateBasicInfo("jobTitle", e.target.value)}
                  className={formInputClass}
                  placeholder="e.g. Senior Product Designer"
                />
              </div>
              <div className="col-span-2">
                <label className={formLabelClass}>Website / Portfolio</label>
                <input
                  type="url"
                  value={basicInfo.website ?? ""}
                  onChange={(e) => updateBasicInfo("website", e.target.value)}
                  className={formInputClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className={formLabelClass}>Location</label>
                <input
                  type="text"
                  value={basicInfo.location ?? ""}
                  onChange={(e) => updateBasicInfo("location", e.target.value)}
                  className={formInputClass}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>
              <div>
                <label className={formLabelClass}>LinkedIn</label>
                <input
                  type="url"
                  value={basicInfo.linkedIn ?? ""}
                  onChange={(e) => updateBasicInfo("linkedIn", e.target.value)}
                  className={formInputClass}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className={sectionHeading}>Professional Summary</h3>
              <button
                type="button"
                disabled={regeneratingSummary}
                onClick={async () => {
                  setRegeneratingSummary(true);
                  setSaveError(null);
                  const result = await regenerateProfessionalSummaryAction(content);
                  setRegeneratingSummary(false);
                  if (result.summary != null) updateSummary(result.summary);
                  else if (result.error) setSaveError(result.error);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {regeneratingSummary ? "Generating…" : "Regenerate with AI"}
              </button>
            </div>
            <textarea
              rows={4}
              value={content.summary ?? ""}
              onChange={(e) => updateSummary(e.target.value)}
              className={formTextareaClass}
              placeholder="Briefly describe your professional background and goals..."
            />
          </div>

          {/* Experience */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={sectionHeading}>Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add Experience
              </button>
            </div>
            <div className="relative space-y-6 border-l-2 border-slate-100 pl-4">
              {(content.experience ?? []).map((exp, i) => (
                <div key={i} className="relative space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={formLabelClass}>Job Title</label>
                      <input
                        type="text"
                        value={exp.title ?? ""}
                        onChange={(e) => updateExperience(i, "title", e.target.value)}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Company</label>
                      <input
                        type="text"
                        value={exp.company ?? ""}
                        onChange={(e) => updateExperience(i, "company", e.target.value)}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate ?? ""}
                        onChange={(e) => updateExperience(i, "startDate", e.target.value)}
                        className={formInputClass}
                        placeholder="e.g. Jan 2021"
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>End Date</label>
                      <input
                        type="text"
                        value={exp.current ? "Present" : (exp.endDate ?? "")}
                        onChange={(e) => {
                          const v = e.target.value;
                          const isPresent = /present|current|now/i.test(v);
                          updateExperience(i, "current", isPresent);
                          updateExperience(i, "endDate", isPresent ? "" : v);
                        }}
                        className={formInputClass}
                        placeholder="Present"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={formLabelClass}>Description</label>
                      <textarea
                        rows={3}
                        value={exp.description ?? ""}
                        onChange={(e) => updateExperience(i, "description", e.target.value)}
                        className={formTextareaClass}
                        placeholder="Key responsibilities and achievements..."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(i)}
                    className="absolute -left-4 top-0 rounded-full bg-white p-1 text-slate-400 transition-colors hover:text-red-500"
                    aria-label="Remove experience"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={sectionHeading}>Education</h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add Education
              </button>
            </div>
            <div className="space-y-6">
              {(content.education ?? []).map((ed, i) => (
                <div key={i} className="relative grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={formLabelClass}>Degree / Certification</label>
                    <input
                      type="text"
                      value={ed.degree ?? ""}
                      onChange={(e) => updateEducation(i, "degree", e.target.value)}
                      className={formInputClass}
                      placeholder="e.g. B.S. in Graphic Communication"
                    />
                  </div>
                  <div>
                    <label className={formLabelClass}>School</label>
                    <input
                      type="text"
                      value={ed.institution ?? ""}
                      onChange={(e) => updateEducation(i, "institution", e.target.value)}
                      className={formInputClass}
                      placeholder="e.g. University of Design"
                    />
                  </div>
                  <div>
                    <label className={formLabelClass}>Year</label>
                    <input
                      type="text"
                      value={ed.endDate ?? ed.startDate ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateEducation(i, "endDate", v);
                        if (!ed.startDate) updateEducation(i, "startDate", v);
                      }}
                      className={formInputClass}
                      placeholder="e.g. 2015"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(i)}
                    className="absolute -right-2 -top-2 rounded p-1 text-slate-400 hover:text-red-500"
                    aria-label="Remove education"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={sectionHeading}>Certifications</h3>
              <button type="button" onClick={addCertification} className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                <Plus className="h-4 w-4" aria-hidden /> Add
              </button>
            </div>
            <div className="space-y-4">
              {(content.certifications ?? []).map((cert, i) => (
                <div key={i} className="relative grid grid-cols-2 gap-4 rounded-lg border border-slate-100 p-4">
                  <div>
                    <label className={formLabelClass}>Name</label>
                    <input type="text" value={cert.name ?? ""} onChange={(e) => updateCertification(i, "name", e.target.value)} className={formInputClass} placeholder="e.g. AWS Certified Solutions Architect" />
                  </div>
                  <div>
                    <label className={formLabelClass}>Issuer</label>
                    <input type="text" value={cert.issuer ?? ""} onChange={(e) => updateCertification(i, "issuer", e.target.value)} className={formInputClass} placeholder="e.g. Amazon Web Services" />
                  </div>
                  <div>
                    <label className={formLabelClass}>Date</label>
                    <input type="text" value={cert.date ?? ""} onChange={(e) => updateCertification(i, "date", e.target.value)} className={formInputClass} placeholder="e.g. 2023" />
                  </div>
                  <div>
                    <label className={formLabelClass}>URL</label>
                    <input type="url" value={cert.url ?? ""} onChange={(e) => updateCertification(i, "url", e.target.value)} className={formInputClass} placeholder="https://..." />
                  </div>
                  <button type="button" onClick={() => removeCertification(i)} className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-red-500" aria-label="Remove"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={sectionHeading}>Projects</h3>
              <button type="button" onClick={addProject} className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                <Plus className="h-4 w-4" aria-hidden /> Add
              </button>
            </div>
            <div className="space-y-4">
              {(content.projects ?? []).map((proj, i) => (
                <div key={i} className="relative space-y-4 rounded-lg border border-slate-100 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={formLabelClass}>Project name</label>
                      <input type="text" value={proj.name ?? ""} onChange={(e) => updateProject(i, "name", e.target.value)} className={formInputClass} placeholder="e.g. Open-source CLI tool" />
                    </div>
                    <div>
                      <label className={formLabelClass}>URL</label>
                      <input type="url" value={proj.url ?? ""} onChange={(e) => updateProject(i, "url", e.target.value)} className={formInputClass} placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <label className={formLabelClass}>Description</label>
                    <textarea rows={2} value={proj.description ?? ""} onChange={(e) => updateProject(i, "description", e.target.value)} className={formTextareaClass} placeholder="Brief description and outcomes..." />
                  </div>
                  <div>
                    <label className={formLabelClass}>Tech / keywords</label>
                    <input type="text" value={proj.tech ?? ""} onChange={(e) => updateProject(i, "tech", e.target.value)} className={formInputClass} placeholder="e.g. React, Node.js" />
                  </div>
                  <button type="button" onClick={() => removeProject(i)} className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-red-500" aria-label="Remove"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={sectionHeading}>Languages</h3>
              <button type="button" onClick={addLanguage} className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                <Plus className="h-4 w-4" aria-hidden /> Add
              </button>
            </div>
            <div className="space-y-4">
              {(content.languages ?? []).map((lang, i) => (
                <div key={i} className="flex items-center gap-4">
                  <input type="text" value={lang.language ?? ""} onChange={(e) => updateLanguage(i, "language", e.target.value)} className={formInputClass} placeholder="e.g. English" />
                  <input type="text" value={lang.level ?? ""} onChange={(e) => updateLanguage(i, "level", e.target.value)} className={formInputClass} placeholder="e.g. Native, Fluent, Professional" />
                  <button type="button" onClick={() => removeLanguage(i)} className="rounded p-1 text-slate-400 hover:text-red-500" aria-label="Remove"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={sectionHeading}>Skills</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={regeneratingSkills}
                  onClick={async () => {
                    setRegeneratingSkills(true);
                    setSaveError(null);
                    const result = await regenerateSkillsAction(content);
                    setRegeneratingSkills(false);
                    if (result.skills != null) replaceSkills(result.skills);
                    else if (result.error) setSaveError(result.error);
                  }}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  {regeneratingSkills ? "Generating…" : "Regenerate with AI"}
                </button>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="e.g. Python, React"
                  className="h-9 w-32 rounded-md border border-slate-200 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add Skill
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(content.skills ?? []).map((s, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                >
                  <input
                    type="text"
                    value={s.name ?? ""}
                    onChange={(e) => updateSkillName(i, e.target.value)}
                    className="w-24 min-w-0 border-none bg-transparent p-0 text-sm focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="text-slate-400 transition-colors hover:text-red-500"
                    aria-label="Remove skill"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}
      </section>
    </div>
  );
}
