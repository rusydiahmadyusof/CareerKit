import { createHash } from "crypto";

/**
 * Creates a stable hash for ATS scoring inputs.
 *
 * Important: `computeATSScore` trims `jobDescription` to the first 4000 chars,
 * so we do the same here to avoid unnecessary recomputation when users paste
 * long descriptions that only differ after that point.
 */
export function getAtsJobContextHash(jobRole: string, jobDescription: string): string {
  const role = jobRole.trim();
  const desc = jobDescription.trim().slice(0, 4000);
  return createHash("sha256").update(`${role}\n${desc}`).digest("hex");
}

