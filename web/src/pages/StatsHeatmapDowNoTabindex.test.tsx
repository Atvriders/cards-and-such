import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2271 — Sibling-test partner to W2064 (no `id` on day labels), W1198
 * (head row aria-hidden + Mon..Sun day labels in order), W1784 (day-label
 * SPAN tag), W1795 (no title + no element children), and W1808 (no
 * explicit ARIA role). The heatmap's seven Mon..Sun day-of-week labels
 * render as bare `<span class="stats-heatmap-dow">` elements with NO
 * `tabindex` attribute — they are presentational cells under an
 * `aria-hidden="true"` head row and must not be reachable by keyboard
 * focus.
 *
 * The slip-through this test catches: a refactor that adds
 * `tabindex="0"` (or any tabindex) to the day labels, perhaps because
 * some other span variant became focusable and the change got copy-pasted.
 * Putting these spans into the tab order would (a) inject seven dead
 * focus stops that render no actionable content, (b) create focusable
 * elements inside an `aria-hidden="true"` subtree (an a11y anti-pattern
 * — focusable but hidden from AT), and (c) muddy keyboard navigation
 * around the chart. Pin the absence of any `tabindex` attribute on every
 * day label so any future tabindex-injection fails loudly here.
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

describe("StatsPage heatmap day-of-week label has no tabindex attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2271: stats-cat-heatmap head row day labels carry no tabindex attribute (not focusable; live under aria-hidden head row)", () => {
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
    expect(first.hasAttribute("tabindex")).toBe(false);

    for (const label of Array.from(dowLabels)) {
      // No tabindex — these spans live under an aria-hidden head row and
      // must not be reachable by keyboard focus. A focusable element
      // inside an aria-hidden subtree is an a11y anti-pattern.
      expect(label.hasAttribute("tabindex")).toBe(false);
      expect(label.getAttribute("tabindex")).toBeNull();
    }
  });
});
