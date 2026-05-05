import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2522: StatsPage's "Activity" stats card (data-testid="stats-activity")
 * is currently rendered WITHOUT an `aria-describedby` attribute. Sibling
 * tests pin adjacent contracts on this same node:
 *   - tagName=DIV, exact className equality, no `id`, no inline `style`,
 *     no `tabindex`, no `role` (W2350), and the absence of `aria-label`
 *     and `aria-labelledby` (W2014).
 *   - W2488 pins the firstElementChild's tagName.
 * However, no existing test pins the absence of `aria-describedby` on the
 * stats-activity card itself. Because the card is a plain `<div>` (not a
 * landmark or a `<section>`), adding `aria-describedby` would silently
 * attach a screen-reader description string to the wrapper, changing
 * announcements when assistive tech reaches the card. Per-chart
 * descriptions are intentionally carried by the inner SVG/canvas, NOT by
 * an aria attribute on the outer wrapper. Pin the absence of
 * `aria-describedby` so any future change that adds it is reviewed
 * deliberately.
 */
describe("StatsPage stats-activity card — aria-describedby absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2522: stats-activity card has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card.hasAttribute("aria-describedby")).toBe(false);
  });
});
