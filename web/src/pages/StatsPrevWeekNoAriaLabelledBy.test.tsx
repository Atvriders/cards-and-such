import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2635: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" and contains three read-only
 * summary rows (Prior plays / Prior wins / Prior avg time). Each row's
 * meaning is carried by an inline <span class="stats-week-label"> child,
 * so the list itself does not — and should not — carry an `aria-labelledby`
 * pointer to an external heading. Sibling pins already cover the absence
 * of `id`, `role`, `style`, `tabindex`, and `aria-label`, plus the exact
 * class string and child counts, but no existing test pins the absence of
 * an `aria-labelledby` attribute on this <ul>. Adding an `aria-labelledby`
 * would (a) introduce an authored accessible name sourced from another
 * element's id that could silently break if that element is renamed or
 * removed, and (b) change the screen-reader announcement contract for this
 * presentational list. Pinning the absence of `aria-labelledby` ensures
 * any future refactor that attempts to wire the list to a labelling
 * element is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-labelledby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2635: stats-prev-week ul has no aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-labelledby")).toBe(false);
    expect(ul.getAttribute("aria-labelledby")).toBeNull();
  });
});
