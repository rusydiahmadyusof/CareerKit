import OpenAI from "openai";
import type { ResumeContent, Profile } from "@/lib/types/database";

const resumeContentSchema = `{
  "basicInfo": { "fullName": string, "email": string, "jobTitle": string, "website": string },
  "summary": string,
  "experience": [{ "title": string, "company": string, "startDate": string, "endDate": string, "current": boolean, "description": string }],
  "education": [{ "institution": string, "degree": string, "startDate": string, "endDate": string, "description": string }],
  "skills": [{ "name": string, "category": string }]
}`;

/** Parses raw JSON string from LLM into ResumeContent. Returns null if invalid. */
function parseResumeContentFromRaw(raw: string): ResumeContent | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const content: ResumeContent = {};

    if (parsed.basicInfo && typeof parsed.basicInfo === "object") {
      const b = parsed.basicInfo as Record<string, unknown>;
      content.basicInfo = {
        fullName: typeof b.fullName === "string" ? b.fullName : undefined,
        email: typeof b.email === "string" ? b.email : undefined,
        jobTitle: typeof b.jobTitle === "string" ? b.jobTitle : undefined,
        website: typeof b.website === "string" ? b.website : undefined,
      };
    }
    if (typeof parsed.summary === "string") content.summary = parsed.summary;
    if (Array.isArray(parsed.experience)) {
      content.experience = parsed.experience.map((e: unknown) => {
        if (typeof e !== "object" || e === null) return {};
        const x = e as Record<string, unknown>;
        return {
          title: typeof x.title === "string" ? x.title : undefined,
          company: typeof x.company === "string" ? x.company : undefined,
          startDate: typeof x.startDate === "string" ? x.startDate : undefined,
          endDate: typeof x.endDate === "string" ? x.endDate : undefined,
          current: typeof x.current === "boolean" ? x.current : undefined,
          description: typeof x.description === "string" ? x.description : undefined,
        };
      });
    }
    if (Array.isArray(parsed.education)) {
      content.education = parsed.education.map((e: unknown) => {
        if (typeof e !== "object" || e === null) return {};
        const x = e as Record<string, unknown>;
        return {
          institution: typeof x.institution === "string" ? x.institution : undefined,
          degree: typeof x.degree === "string" ? x.degree : undefined,
          startDate: typeof x.startDate === "string" ? x.startDate : undefined,
          endDate: typeof x.endDate === "string" ? x.endDate : undefined,
          description: typeof x.description === "string" ? x.description : undefined,
        };
      });
    }
    if (Array.isArray(parsed.skills)) {
      content.skills = parsed.skills.map((s: unknown) => {
        if (typeof s !== "object" || s === null) return {};
        const x = s as Record<string, unknown>;
        return {
          name: typeof x.name === "string" ? x.name : undefined,
          category: typeof x.category === "string" ? x.category : undefined,
        };
      });
    }

    return content;
  } catch {
    return null;
  }
}

/**
 * Generates structured resume content from a job title and description,
 * optionally using base resume content for tailoring.
 * Uses Groq if GROQ_API_KEY is set (free tier), otherwise OpenAI if OPENAI_API_KEY is set.
 * Returns null if no API key is set or the API call fails.
 */
export async function generateResumeContentFromJob(
  jobTitle: string,
  jobDescription: string,
  baseContent?: ResumeContent | null
): Promise<ResumeContent | null> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  let client: OpenAI;
  let model: string;

  if (groqKey) {
    client = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
    model = "llama-3.3-70b-versatile";
  } else if (openaiKey) {
    client = new OpenAI({ apiKey: openaiKey });
    model = "gpt-4o-mini";
  } else {
    return null;
  }

  const baseContext = baseContent
    ? `\n\nCandidate's actual experience, education, and background (use these facts only; do not invent):\n${JSON.stringify(baseContent)}`
    : "";

  const systemPrompt = `You are a resume writer. Given a job title and job description, produce a single JSON object that represents resume content. 
The JSON must match this shape exactly (all fields strings or arrays; use empty strings or empty arrays if not applicable): ${resumeContentSchema}
Rules: Use the job description to emphasize relevant skills and experience. 
Skills: List only 5–8 measurable, concrete professional skills (e.g. programming languages, frameworks, tools, methodologies). Do NOT include abstract or soft skills like teamwork, adaptability, communication, or leadership. Every skill must be clearly relevant to the role.
If the candidate's experience and education are provided, keep the same roles, dates, and facts; tailor bullet points to the job. Do not invent new jobs or dates.
Summary: Keep the professional summary short—2 to 3 sentences maximum. Base it on the person's actual experience and education. Tie their background to this job in one or two concise sentences. For career switchers, one sentence on transferable relevance is enough. Be direct; avoid wordy or generic phrasing.
If no candidate data is provided, invent plausible but generic experience and education entries that fit the role. 
Respond with only the JSON object, no markdown or explanation.`;

  const userPrompt = `Job title: ${jobTitle}\n\nJob description:\n${jobDescription}${baseContext}`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    return parseResumeContentFromRaw(raw);
  } catch {
    return null;
  }
}

function getLLMClient(): { client: OpenAI; model: string } | null {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (groqKey) {
    return {
      client: new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" }),
      model: "llama-3.3-70b-versatile",
    };
  }
  if (openaiKey) {
    return { client: new OpenAI({ apiKey: openaiKey }), model: "gpt-4o-mini" };
  }
  return null;
}

/**
 * Generates a short professional summary (2–3 sentences) from resume content.
 * Optional job title/description tailors the summary to that role.
 * Returns null if no API key or the call fails.
 */
export async function generateProfessionalSummary(
  content: ResumeContent,
  jobContext?: { jobTitle?: string; jobDescription?: string }
): Promise<string | null> {
  const ctx = getLLMClient();
  if (!ctx) return null;

  const jobPart =
    jobContext?.jobTitle || jobContext?.jobDescription
      ? `\nTarget role context (tailor the summary to this):\nJob title: ${jobContext?.jobTitle ?? "—"}\n${jobContext?.jobDescription ? `Description: ${jobContext.jobDescription.slice(0, 800)}` : ""}`
      : "";

  const systemPrompt = `You write short professional summaries for resumes. Output only the summary text, nothing else. No quotes, no labels, no "Summary:" prefix.
Rules: 2 to 3 sentences maximum. Base everything on the person's experience and education only. Be direct and concise. If job context is given, align the summary to that role in one or two sentences.`;

  const userPrompt = `Resume content:\n${JSON.stringify(content)}${jobPart}\n\nWrite a short professional summary (2–3 sentences).`;

  try {
    const completion = await ctx.client.chat.completions.create({
      model: ctx.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    return raw && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Generates a short professional summary from profile experience and education.
 * Prioritizes most recent and current employment. Returns null if no API key or call fails.
 */
export async function generateProfessionalSummaryFromProfile(
  profile: Pick<Profile, "experience" | "education" | "skills">
): Promise<string | null> {
  const ctx = getLLMClient();
  if (!ctx) return null;

  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const hasExperience = experience.some(
    (e) => (e?.title?.trim() || e?.company?.trim() || e?.description?.trim())
  );
  if (!hasExperience) return null;

  const systemPrompt = `You write short professional summaries for profiles. Output only the summary text, nothing else. No quotes, no labels, no "Summary:" prefix.
Rules: 2 to 3 sentences maximum. Base everything on the person's experience and education only. Prioritize the most recent and current employment—lead with their current or latest role, title, and company, then one or two key strengths or outcomes. Be direct and concise.`;

  const contentForPrompt = {
    experience: experience.map((e) => ({
      title: e?.title,
      company: e?.company,
      startDate: e?.startDate,
      endDate: e?.endDate,
      current: e?.current,
      description: e?.description,
    })),
    education: profile.education ?? [],
    skills: profile.skills ?? [],
  };

  const userPrompt = `Profile (experience is listed with most recent first; "current": true means they still work there):\n${JSON.stringify(contentForPrompt)}\n\nWrite a short professional summary (2–3 sentences). Prioritize current and most recent role.`;

  try {
    const completion = await ctx.client.chat.completions.create({
      model: ctx.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    return raw && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Generates 5–8 professional skills from profile experience and education.
 * Prioritizes skills from most recent and current employment. Returns null if no API key or call fails.
 */
export async function generateSkillsFromProfile(
  profile: Pick<Profile, "experience" | "education" | "skills">
): Promise<SkillEntry[] | null> {
  const ctx = getLLMClient();
  if (!ctx) return null;

  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const hasExperience = experience.some(
    (e) => (e?.title?.trim() || e?.company?.trim() || e?.description?.trim())
  );
  if (!hasExperience) return null;

  const systemPrompt = `You suggest profile skills. Output a single JSON object with key "skills": an array of skill objects. Each: { "name": string, "category": string }. No markdown.

CRITICAL - ONLY include measurable, concrete, professional skills that can be verified or tested:
- YES: programming languages (Python, JavaScript), frameworks (React, Django), tools (Git, AWS, Figma), methodologies (Agile, Scrum), domains (Financial modeling, SEO), certifications.
- NO soft or abstract skills. Never include: teamwork, collaboration, communication, adaptability, flexibility, leadership, problem-solving, critical thinking, time management, work ethic, attention to detail, multitasking, interpersonal skills, self-motivation, creativity (as a standalone skill), organization, or any similar trait. If in doubt, omit it.
5 to 8 skills. Base only on the profile. Prioritize skills drawn from the person's most recent and current role first, then earlier experience and education.`;

  const contentForPrompt = {
    experience: experience.map((e) => ({
      title: e?.title,
      company: e?.company,
      startDate: e?.startDate,
      endDate: e?.endDate,
      current: e?.current,
      description: e?.description,
    })),
    education: profile.education ?? [],
  };

  const userPrompt = `Profile (experience is listed with most recent first; "current": true means they still work there):\n${JSON.stringify(contentForPrompt)}\n\nOutput JSON: { "skills": [ { "name": "...", "category": "..." }, ... ] } with 5–8 measurable professional skills only (no soft skills). Prioritize skills from current and most recent role.`;

  try {
    const completion = await ctx.client.chat.completions.create({
      model: ctx.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const list = Array.isArray(parsed.skills) ? parsed.skills : Array.isArray(parsed) ? parsed : null;
    if (!list) return null;
    const skills: SkillEntry[] = list
      .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
      .map((s) => ({
        name: typeof s.name === "string" ? s.name : "",
        category: typeof s.category === "string" ? s.category : "",
      }))
      .filter((s) => s.name.trim() !== "")
      .filter((s) => !isSoftSkill(s.name ?? ""));
    return skills.length > 0 ? skills : null;
  } catch {
    return null;
  }
}

type SkillEntry = { name?: string; category?: string };

/** Soft/abstract skill terms to exclude from generated skills (lowercase). */
const SOFT_SKILL_BLOCKLIST = [
  "teamwork", "collaboration", "communication", "adaptability", "flexibility",
  "leadership", "problem-solving", "problem solving", "critical thinking",
  "time management", "work ethic", "attention to detail", "multitasking",
  "interpersonal", "self-motivation", "self motivation", "creativity",
  "organization", "organizational", "motivation", "initiative", "reliable",
  "dedication", "patience", "empathy", "negotiation", "mentoring", "coaching",
  "presentation skills", "written communication", "verbal communication",
  "active listening", "conflict resolution", "stress management",
  "fast learner", "quick learner", "hardworking", "proactive", "innovative",
  "strategic thinking", "analytical thinking", "decision making", "decision-making",
];

function isSoftSkill(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return SOFT_SKILL_BLOCKLIST.some((term) => lower === term || lower.includes(term));
}

/**
 * Generates 5–8 high-level skills from resume content.
 * Optional job context tailors skills to that role.
 * Returns null if no API key or the call fails.
 */
export async function generateSkillsFromContent(
  content: ResumeContent,
  jobContext?: { jobTitle?: string; jobDescription?: string }
): Promise<SkillEntry[] | null> {
  const ctx = getLLMClient();
  if (!ctx) return null;

  const jobPart =
    jobContext?.jobTitle || jobContext?.jobDescription
      ? `\nTarget role (prioritize skills that match this job):\nJob title: ${jobContext?.jobTitle ?? "—"}\n${jobContext?.jobDescription ? `Description: ${jobContext.jobDescription.slice(0, 600)}` : ""}`
      : "";

  const systemPrompt = `You suggest resume skills. Output a single JSON object with key "skills": an array of skill objects. Each: { "name": string, "category": string }. No markdown.

CRITICAL - ONLY include measurable, concrete, professional skills that can be verified or tested:
- YES: programming languages (Python, JavaScript), frameworks (React, Django), tools (Git, AWS, Figma), methodologies (Agile, Scrum), domains (Financial modeling, SEO), certifications.
- NO soft or abstract skills. Never include: teamwork, collaboration, communication, adaptability, flexibility, leadership, problem-solving, critical thinking, time management, work ethic, attention to detail, multitasking, interpersonal skills, self-motivation, creativity (as a standalone skill), organization, or any similar trait. If in doubt, omit it.
5 to 8 skills. Base only on the resume content. If job context is given, prioritize skills that match the role.`;

  const userPrompt = `Resume content:\n${JSON.stringify(content)}${jobPart}\n\nOutput JSON: { "skills": [ { "name": "...", "category": "..." }, ... ] } with 5–8 measurable professional skills only (no soft skills).`;

  try {
    const completion = await ctx.client.chat.completions.create({
      model: ctx.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const list = Array.isArray(parsed.skills) ? parsed.skills : Array.isArray(parsed) ? parsed : null;
    if (!list) return null;
    const skills: SkillEntry[] = list
      .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
      .map((s) => ({
        name: typeof s.name === "string" ? s.name : "",
        category: typeof s.category === "string" ? s.category : "",
      }))
      .filter((s) => s.name.trim() !== "")
      .filter((s) => !isSoftSkill(s.name ?? ""));
    return skills.length > 0 ? skills : null;
  } catch {
    return null;
  }
}

export interface ATSAspects {
  /** 0–100: keyword overlap with job description */
  keywords: number;
  /** 0–100: relevance of work history to the role */
  experience: number;
  /** 0–100: alignment of listed skills with job requirements */
  skills: number;
}

export interface ATSScoreResult {
  score: number;
  feedback: string;
  /** Per-aspect scores so the user sees which part to improve */
  aspects?: ATSAspects;
}

function clampScore(n: unknown): number | null {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  return Math.round(Math.min(100, Math.max(0, n)));
}

/**
 * Scores how well a resume matches a job description (ATS-style).
 * Returns score 0–100, short feedback, and optional aspect scores. Null if no API key or call fails.
 */
export async function computeATSScore(
  resumeContent: ResumeContent,
  jobRole: string,
  jobDescription: string
): Promise<ATSScoreResult | null> {
  const ctx = getLLMClient();
  if (!ctx) return null;

  const systemPrompt = `You act as an ATS (Applicant Tracking System) evaluator. Compare the resume to the job description and output a JSON object with these keys:
- "score": number 0–100 (overall match).
- "feedback": string with 2–3 short, actionable improvement tips (one sentence each). Be specific and constructive.
- "aspects": object with three numbers 0–100:
  - "keywords": how well resume keywords and phrases match the job description.
  - "experience": how relevant the work history is to the role (titles, duties, outcomes).
  - "skills": how well the listed skills align with job requirements.

Output only valid JSON, no markdown. Example: {"score": 72, "feedback": "Add more keywords from the job description. Highlight quantifiable results.", "aspects": {"keywords": 65, "experience": 80, "skills": 72}}`;

  const jobDescTrimmed = jobDescription.slice(0, 4000);
  const userPrompt = `Job role: ${jobRole}\n\nJob description:\n${jobDescTrimmed}\n\nResume content (JSON):\n${JSON.stringify(resumeContent)}\n\nOutput JSON with "score", "feedback", and "aspects" (object with keywords, experience, skills as numbers 0-100).`;

  try {
    const completion = await ctx.client.chat.completions.create({
      model: ctx.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const score = clampScore(parsed.score);
    const feedback = typeof parsed.feedback === "string" ? parsed.feedback.trim() : "";
    if (score === null) return null;

    const aspectsObj = parsed.aspects as Record<string, unknown> | undefined;
    let aspects: ATSAspects | undefined;
    if (aspectsObj && typeof aspectsObj === "object") {
      const kw = clampScore(aspectsObj.keywords);
      const exp = clampScore(aspectsObj.experience);
      const sk = clampScore(aspectsObj.skills);
      if (kw !== null && exp !== null && sk !== null) {
        aspects = { keywords: kw, experience: exp, skills: sk };
      }
    }

    return {
      score,
      feedback: feedback || "No feedback.",
      aspects,
    };
  } catch {
    return null;
  }
}

/**
 * Revises resume content using ATS feedback to improve match with the job.
 * Returns revised ResumeContent or null if the call fails.
 */
export async function refineResumeContentWithATSFeedback(
  content: ResumeContent,
  jobRole: string,
  jobDescription: string,
  atsFeedback: string
): Promise<ResumeContent | null> {
  const ctx = getLLMClient();
  if (!ctx) return null;

  const systemPrompt = `You improve a resume so it scores higher with ATS (Applicant Tracking Systems). You are given the current resume (JSON), the job role and description, and feedback from an ATS-style evaluation. Revise the resume to address the feedback: add or align keywords, strengthen bullets, or adjust the summary/skills. Keep the same JSON structure: basicInfo, summary, experience, education, skills. Do not invent new jobs or dates—only rephrase and add relevant keywords from the job description. Respond with only the revised resume JSON object, no markdown or explanation.`;

  const jobDescTrimmed = jobDescription.slice(0, 3000);
  const userPrompt = `Job role: ${jobRole}\n\nJob description:\n${jobDescTrimmed}\n\nATS feedback to address:\n${atsFeedback}\n\nCurrent resume (JSON):\n${JSON.stringify(content)}\n\nOutput the revised resume as a single JSON object (same keys: basicInfo, summary, experience, education, skills).`;

  try {
    const completion = await ctx.client.chat.completions.create({
      model: ctx.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    return parseResumeContentFromRaw(raw);
  } catch {
    return null;
  }
}
