"use server";

/**
 * Shared server-action result shapes.
 *
 * - Prefer `{ ok: true }` for success when an action returns a value to the client.
 * - Prefer `{ error: string }` for failures when an action wants to display an error.
 */
export type ActionOk = { ok: true };
export type ActionError = { error: string };
export type ActionResult = ActionOk | ActionError;

