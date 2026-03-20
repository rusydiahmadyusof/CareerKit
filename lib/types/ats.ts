/**
 * ATS (Applicant Tracking System) scoring types.
 * Used by tailor-resume and resume editor.
 */

export interface ATSAspects {
  keywords: number;
  experience: number;
  skills: number;
}

export interface ATSScoreResult {
  score: number;
  feedback?: string;
  aspects?: ATSAspects;
}
