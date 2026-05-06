import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2706: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" and contains three read-only
 * summary rows (Prior plays / Prior wins / Prior avg time). It carries no
 * authored ARIA role override, so adding an `aria-roledescription` would
 * (a) attach a custom screen-reader role announcement that drifts from the
 * implicit "list" semantics, and (b) silently change the assistive-tech
 * contract for what is intended to be a plain presentational list.
 * Sibling pins already cover the absence of `id`, `role`, `style`,
 * `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-busy`, and `aria-hidden` on this <ul>, plus the
 * exact class string and child counts — but no existing test pins the
 * absence of an `aria-roledescription` attribute. Pinning it ensures any
 * future attempt to attach a custom role description is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-roledescription attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2706: stats-prev-week ul has no aria-roledescription attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-roledescription")).toBe(false);
    expect(ul.getAttribute("aria-roledescription")).toBeNull();
  });
});
