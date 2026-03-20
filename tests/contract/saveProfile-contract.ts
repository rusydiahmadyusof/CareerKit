import type { ActionResult } from "@/lib/actions/action-result";
import { saveProfile } from "@/lib/actions/profile";
import type { ProfileUpdate } from "@/lib/types/database";

// Contract: the UI expects `saveProfile()` to resolve to the shared `ActionResult` union.
type SaveProfileReturn = Awaited<ReturnType<typeof saveProfile>>;

// If `saveProfile()` ever changes its return shape, this assignment will fail type-checking.
const _typeCheck: ActionResult = null as unknown as SaveProfileReturn;

// Extra sanity: `saveProfile` still accepts the expected payload type.
const _acceptsPayload: (data: ProfileUpdate) => Promise<ActionResult> = saveProfile;

export {};

