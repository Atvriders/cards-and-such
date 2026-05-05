import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2127 — Sibling-test partner to W2064 (no `id` attribute), W1784 (SPAN
 * tag), W1795 (no `title` + no element children), and W1808 (no explicit
 * ARIA role). The heatmap's seven Mon..Sun day-of-week labels render as
 * bare `<span class="stats-heatmap-dow">` elements built only from JSX:
 *
 *   <span key={d} className="stats-heatmap-dow">{d}</span>
 *
 * These labels live under an `aria-hidden="true"` head row and are pure
 * presentational text. Unlike the heatmap data CELLS — which legitimately
 * carry an inline `style={{opacity: ...}}` to encode play intensity —
 * the day-of-week head spans must NOT carry any inline `style` attribute.
 *
 * The slip-through this test catches: a well-meaning refactor that pipes
 * a runtime color, weight, opacity, or width onto each label (e.g.
 * `style={{color: weekendIdx >= 5 ? "var(--accent)" : undefined}}` to
 * tint Sat/Sun, or `style={{opacity: idx === todayDow ? 1 : 0.6}}` to
 * highlight today's column). That would not trip the tag check, the
 * id check, the role check, the title/children check, or the count +
 * className + text checks — but it would (a) blur the boundary between
 * stylesheet-driven layout and JS-driven runtime presentation on a head
 * row that is intentionally aria-hidden and decoration-only, (b) defeat
 * dark-mode / theme overrides defined in the CSS file, and (c) raise the
 * CSP burden if the app ever moves to `style-src 'self'` without
 * `'unsafe-inline'`. Pin the absence of any inline `style` attribute on
 * every day label so any future style-injection fails loudly here.
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

describe("StatsPage heatmap day-of-week label has no inline style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2127: stats-cat-heatmap head row day labels carry no inline style attribute (CSS-only, no runtime per-label theming)", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head");
    expect(headRow).not.toBeNull();

    const dowLabels = headRow!.querySelectorAll(".stats-heatmap-dow");
    // Sanity: W1198 pins the count, but re-asserting keeps this test
    // independent — if the count drifts, fix W1198 before debugging here.
    expect(dowLabels.length).toBe(7);

    // Spot-check the first label explicitly so a regression message points
    // at this exact assertion before the loop generalizes it.
    const first = dowLabels[0]!;
    expect(first.hasAttribute("style")).toBe(false);

    for (const label of Array.from(dowLabels)) {
      // No inline style — head-row day labels must remain CSS-only so
      // theme overrides win and no runtime per-label coloring sneaks in.
      expect(label.hasAttribute("style")).toBe(false);
      expect(label.getAttribute("style")).toBeNull();
    }
  });
});
