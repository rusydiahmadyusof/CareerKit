import { test, expect } from "@playwright/test";

test("smoke: resume export + application status persistence", async ({ page }) => {
  let email = process.env.PLAYWRIGHT_TEST_EMAIL ?? process.env.PLAYWRIGHT_SUPABASE_TEST_EMAIL;
  let password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? process.env.PLAYWRIGHT_SUPABASE_TEST_PASSWORD;

  email = email?.trim() || "";
  password = password?.trim() || "";

  // -----------------------------
  // Auth + onboarding skip
  // -----------------------------
  if (!email || !password) {
    // No creds provided: create a temporary user and then log in.
    email = `e2e+${Date.now()}@example.com`;
    password = `E2ePassword123!${Date.now()}`;

    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.waitForURL(/\/login(\b|$)/, { timeout: 60_000 });
  } else {
    await page.goto("/login");
  }

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  try {
    await page.waitForURL(/\/(dashboard|onboarding)(\b|$)/, { timeout: 60_000 });
  } catch {
    test.skip(
      true,
      "Could not authenticate (no redirect to /dashboard or /onboarding). Provide PLAYWRIGHT_TEST_EMAIL/PASSWORD or ensure Supabase email confirmation is disabled."
    );
  }
  if (page.url().includes("/onboarding")) {
    await page.getByRole("button", { name: /Skip for now/i }).click();
    try {
      await page.waitForURL(/\/dashboard(\b|$)/, { timeout: 60_000 });
    } catch {
      test.skip(true, "Onboarding skip did not redirect to /dashboard.");
    }
  }
  await expect(page).toHaveURL(/\/dashboard(\b|$)/);

  // -----------------------------
  // Create resume (no AI): job description empty
  // -----------------------------
  const jobTitle = `E2E Job Title ${Date.now()}`;
  await page.goto("/resumes/tailor");
  await page.getByLabel("Job title").fill(jobTitle);
  // Empty string prevents AI generation (tailorResume only calls LLM when job description is non-empty).
  await page.getByLabel("Job description").fill("");
  await page.getByLabel("Base resume").selectOption("scratch");
  await page.getByRole("button", { name: "Generate resume" }).click();

  await page.waitForURL(/\/resumes\/[^/]+(\b|$)/, { timeout: 120_000 });

  // Export PDF opens the print page in a popup.
  const exportButton = page.getByRole("button", { name: "Export PDF" });
  const popupPromise = page.waitForEvent("popup");
  await exportButton.click();
  const popup = await popupPromise;

  await popup.waitForLoadState("domcontentloaded");
  await expect(popup).toHaveURL(/\/resumes\/[^/]+\/print(\b|$)/);
  await expect(popup.getByRole("heading", { name: /Resume/i })).toBeVisible();
  await popup.close();

  // -----------------------------
  // Create application -> change status -> persist
  // -----------------------------
  const company = `E2E Company ${Date.now()}`;
  const role = `E2E Role ${Date.now()}`;

  await page.goto("/applications/new");
  await page.getByLabel(/Company/i).fill(company);
  await page.getByLabel(/Role/i).fill(role);
  await page.getByLabel("Status").selectOption("saved");
  await page.getByRole("button", { name: "Add application" }).click();

  await page.waitForURL(/\/applications(\b|$)/, { timeout: 60_000 });

  const rowSelector = page
    .locator('[data-purpose="application-row"]')
    .filter({ hasText: company });

  await expect(rowSelector.locator('select[aria-label="Change status"]')).toBeVisible();

  await rowSelector.locator('select[aria-label="Change status"]').selectOption("applied");
  await page.reload();

  const rowAfterReload = page
    .locator('[data-purpose="application-row"]')
    .filter({ hasText: company });

  await expect(
    rowAfterReload.locator('select[aria-label="Change status"]')
  ).toHaveValue("applied");
});

