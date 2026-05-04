import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1250 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun
 * day labels) and W1206 (cell className). The category × day-of-week
 * heatmap's *root* container carries `role="img"` plus
 * `aria-label="Plays by category and day of week, last 30 days"` so
 * screen readers announce the whole grid as a single named image — the
 * head row is decorative (W1198 pins `aria-hidden="true"`), and the data
 * rows have no per-row aria, so the root label is the *only* hook
 * assistive tech has for naming this chart. W1224/W1236/W1238 pin the
 * bar/line/pie chart aria-label+role pairs respectively, but no test
 * currently pins the heatmap container's pair. A refactor that drops
 * `role="img"`, renames the copy (e.g. "Heatmap" or "Plays per day"),
 * changes the window from 30 days, or strips the attribute entirely
 * would silently regress heatmap accessibility.
 */

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage heatmap root aria", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1250: stats-cat-heatmap root carries role='img' + aria-label='Plays by category and day of week, last 30 days'", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.getAttribute("role")).toBe("img");
    expect(grid.getAttribute("aria-label")).toBe(
      "Plays by category and day of week, last 30 days",
    );
  });
});
