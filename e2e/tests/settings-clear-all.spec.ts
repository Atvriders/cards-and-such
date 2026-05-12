import { expect, test, type Page } from "../fixtures";

/**
 * SettingsPage "Clear all" → DELETE-gated confirm → reload flow.
 *
 * The Clear-all action wires a `requireText: "DELETE"` confirm (W218):
 * the shared ConfirmDialog (`data-testid="confirm-dialog"`) renders an
 * input (`data-testid="confirm-input"`) and keeps the confirm button
 * (`data-testid="confirm-yes"`) disabled until the user types the literal
 * string "DELETE". On confirm, SettingsPage queues a `window.location
 * .reload()` (deferred ~200ms so the success toast can paint).
 *
 * This spec exercises that contract end-to-end:
 *   1. Click `settings-clear`.
 *   2. Confirm dialog is visible.
 *   3. The confirm button starts disabled.
 *   4. Typing "DELETE" into `confirm-input` enables it.
 *   5. Clicking it dismisses the dialog and the page reloads.
 */

async function loginAs(page: Page, prefix: string): Promise<void> {
  // Server enforces 20-char username limit; keep prefix short.
  const username = `e2e_${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test("settings clear-all gates confirm behind DELETE then reloads", async ({ page }) => {
  await loginAs(page, "setclr");

  await page.goto("/settings", { waitUntil: "domcontentloaded" });

  // Stamp a sentinel onto `window` so we can detect the post-confirm
  // page reload: a fresh document will not carry this property.
  await page.evaluate(() => {
    (window as unknown as { __preReloadSentinel?: boolean }).__preReloadSentinel = true;
  });

  // Open the confirm dialog from the Clear-all action.
  await page.getByTestId("settings-clear").click();
  await expect(page.getByTestId("confirm-dialog")).toBeVisible();

  // The confirm button must be disabled until the requireText matches.
  const confirmYes = page.getByTestId("confirm-yes");
  await expect(confirmYes).toBeDisabled();

  // Typing the literal "DELETE" should enable the confirm button.
  const requireInput = page.getByTestId("confirm-input");
  await expect(requireInput).toBeVisible();
  await requireInput.fill("DELETE");
  await expect(confirmYes).toBeEnabled();

  // Confirming dismisses the dialog and triggers a deferred reload.
  await confirmYes.click();
  await expect(page.getByTestId("confirm-dialog")).toHaveCount(0);

  // Wait for the reload: the sentinel we stamped on the previous
  // document instance must be gone after navigation completes.
  // `page.evaluate` throws while the context is being destroyed mid-reload,
  // so swallow that race and treat it as "still pre-reload" so the poll
  // keeps trying until the fresh document is fully loaded.
  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(
            () =>
              (window as unknown as { __preReloadSentinel?: boolean })
                .__preReloadSentinel === true,
          );
        } catch {
          return true;
        }
      },
      { timeout: 5000 },
    )
    .toBe(false);
});
