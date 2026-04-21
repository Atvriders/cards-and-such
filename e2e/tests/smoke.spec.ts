import { expect, test } from "@playwright/test";

test("user can claim a username, see the shell, and see themselves in Online Now", async ({ page }) => {
  const username = `e2e_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login");
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();

  await expect(page.getByTestId("tile-klondike")).toBeVisible();
  await expect(page.getByTestId("current-user")).toHaveText(username);

  await page.getByRole("link", { name: /leaderboard/i }).click();
  const panel = page.locator(".online-now");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(username, { timeout: 5000 });
});

test("plays tic-tac-toe vs hot-seat and reaches game over", async ({ page }) => {
  const username = `e2e_ttt_${Math.random().toString(36).slice(2, 8)}`;

  // login
  await page.goto("/login");
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page.getByTestId(`tile-tic-tac-toe`)).toBeVisible();

  // enter TTT
  await page.getByTestId("tile-tic-tac-toe").click();
  await expect(page.getByTestId("setup-panel")).toBeVisible();

  // change opponent to hot-seat so we control both sides deterministically
  await page.getByLabel(/opponent/i).selectOption("hot-seat");

  // start
  await page.getByTestId("start-game").click();

  // play a 3x3 top-row win for X: (0,0)X, (1,0)O, (0,1)X, (1,1)O, (0,2)X
  const seq = [[0,0],[1,0],[0,1],[1,1],[0,2]] as const;
  for (const [r, c] of seq) {
    await page.getByTestId(`cell-${r}-${c}`).click();
  }

  // game over
  await expect(page.getByTestId("end-panel")).toBeVisible({ timeout: 5000 });
});
