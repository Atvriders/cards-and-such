import { expect, test, type Page } from "../fixtures";
import AxeBuilder from "@axe-core/playwright";

/**
 * axe-core a11y audit smoke
 *
 * Runs an automated accessibility scan against a handful of high-traffic
 * routes. We deliberately do NOT fail the suite on existing violations —
 * the goal here is to surface a baseline so regressions become obvious in
 * CI logs without blocking deploys. Tighten this once the baseline is
 * cleaned up.
 */

const ROUTES = ["/", "/play/klondike", "/stats", "/settings"] as const;

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `e2e_${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test.describe("a11y smoke (axe-core)", () => {
  for (const route of ROUTES) {
    test(`axe scan: ${route}`, async ({ page }, testInfo) => {
      // Most routes require an authenticated shell; cheaper to always log
      // in than branch per-route, and login itself is covered elsewhere.
      await loginAs(page, "a11y");

      await page.goto(route, { waitUntil: "domcontentloaded" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const summary = {
        route,
        url: page.url(),
        violations: results.violations.length,
        ids: results.violations.map((v) => `${v.id}(${v.nodes.length})`),
      };

      // Log a compact summary plus the full violations payload so CI logs
      // stay scannable while still preserving detail for triage.
      // eslint-disable-next-line no-console
      console.log(`[a11y] ${JSON.stringify(summary)}`);
      if (results.violations.length > 0) {
        // eslint-disable-next-line no-console
        console.log(
          `[a11y] violations for ${route}:\n` +
            JSON.stringify(results.violations, null, 2),
        );
      }

      // Attach the raw axe results so the HTML report carries the data.
      await testInfo.attach(`axe-${route.replace(/\W+/g, "_")}.json`, {
        body: JSON.stringify(results, null, 2),
        contentType: "application/json",
      });

      // Intentionally do NOT assert on results.violations.length — this is
      // a non-blocking baseline. Flip to `expect(results.violations).toEqual([])`
      // once the existing violations are addressed.
      expect(results).toBeTruthy();
    });
  }
});
