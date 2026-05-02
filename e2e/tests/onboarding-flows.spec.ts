import { expect, test, type Page } from "@playwright/test";

/**
 * Smoke coverage for the first-run onboarding surfaces:
 *   - Welcome tutorial carousel (`tut-step-1` … `tut-skip`)
 *   - Lobby coachmark anchored to the Featured strip (`coachmark`,
 *     dismissed via `coachmark-dismiss`)
 *
 * Each test wipes localStorage on the live origin so the carousel and
 * coachmark fire on a truly fresh slate, regardless of whatever the
 * preceding spec left behind.
 */

async function freshOrigin(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
}

test.describe("onboarding flows smoke", () => {
  test("fresh device shows tut-step-1 then skip dismisses the tutorial", async ({ page }) => {
    await freshOrigin(page);
    await page.reload({ waitUntil: "domcontentloaded" });

    const firstStep = page.getByTestId("tut-step-1");
    await expect(firstStep).toBeVisible();

    await page.getByTestId("tut-skip").click();
    await expect(firstStep).toHaveCount(0);
  });

  test("after skipping the tutorial, the coachmark appears on the lobby", async ({ page }) => {
    await freshOrigin(page);
    // Force coachmark into "pending" before the lobby mounts so its
    // initial useState picks it up (the LobbyPage hydrates the coachmark
    // visibility lazily, once, on mount). Skipping the tutorial in the
    // same load wouldn't update that state until a remount.
    await page.evaluate(() => {
      window.localStorage.setItem("cards-onboard-coachmark", "pending");
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    // The welcome tutorial is also armed because we wiped storage. Skip it
    // first so the coachmark isn't visually occluded by the carousel.
    const firstStep = page.getByTestId("tut-step-1");
    if (await firstStep.isVisible().catch(() => false)) {
      await page.getByTestId("tut-skip").click();
      await expect(firstStep).toHaveCount(0);
    }

    const coachmark = page.getByTestId("coachmark");
    await expect(coachmark).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("coachmark-dismiss").click();
    await expect(coachmark).toHaveCount(0);
  });
});
