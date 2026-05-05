import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2488: StatsPage's "Activity" card (data-testid="stats-activity") leads with
 * the export-SVG button as its very first direct child. The export affordance
 * sits ahead of the <h2>Activity</h2> heading, the .stats-summary totals strip,
 * the .stats-range-row range toggle, and the trailing LineChart <svg>.
 *
 * Sibling tests already pin adjacent contracts on this same card node:
 *   - W1850 pins tagName=DIV.
 *   - W1924 pins exact className equality ("stats-card stats-card--exportable").
 *   - W1959 pins direct childElementCount === 5.
 *   - W2000 pins the absence of an `id` attribute.
 *   - W2014 pins the absence of aria-label / aria-labelledby.
 *   - W2123 pins the absence of an inline `style` attribute.
 *   - W2242 pins the absence of a `tabindex` attribute.
 *   - W2350 pins the absence of a `role` attribute.
 *
 * What is NOT pinned by any of those tests is the *order* of the card's
 * direct children. The childElementCount pin guarantees five slots exist,
 * but a refactor could swap the export button into a footer position (or
 * promote the <h2> to lead) without breaking the count. CSS rules that key
 * off `.stats-card--exportable > :first-child` would then silently mis-style
 * the heading, and the export affordance would lose its visual anchor as the
 * card's leading control. Pin the leading slot's tagName=BUTTON so any
 * reorder of the card's top-level layout fails fast.
 */
describe("StatsPage stats-activity card — firstElementChild tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2488: stats-activity card's firstElementChild is a BUTTON element", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    // Sanity: we resolved the activity card itself, not a descendant.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);
    expect(card.classList.contains("stats-card--exportable")).toBe(true);

    const first = card.firstElementChild;
    expect(first).not.toBeNull();
    expect(first!.tagName).toBe("BUTTON");
  });
});
