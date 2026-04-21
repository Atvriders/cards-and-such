import { expect, test } from "@playwright/test";

test("user can claim a username, see the shell, and see themselves in Online Now", async ({ page }) => {
  const username = `e2e_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login");
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();

  await expect(page.getByTestId("placeholder-home")).toBeVisible();
  await expect(page.getByTestId("current-user")).toHaveText(username);

  await page.getByRole("link", { name: /leaderboard/i }).click();
  const panel = page.locator(".online-now");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(username, { timeout: 5000 });
});
