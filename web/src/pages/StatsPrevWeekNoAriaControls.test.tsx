import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2641: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain, presentational <ul> with className
 * "stats-week-list stats-week-list--prev" and three read-only summary rows
 * (Prior plays / Prior wins / Prior avg time). It is not a disclosure
 * trigger, tab, combobox, or any other widget that owns a controlled
 * region, so it does — and should — not carry an `aria-controls`
 * attribute. Sibling pins already cover the absence of `aria-label`,
 * `aria-labelledby`, `aria-describedby`, `id`, `role`, `style`, and
 * `tabindex` on this same ul, but no existing test pins the absence of
 * `aria-controls`. Adding an `aria-controls` reference would (a) imply
 * an interactive owner→controlled relationship that does not exist for
 * this static summary list, and (b) likely point at a non-existent or
 * stale element id, producing an authoring-time accessibility defect.
 * Pinning the absence of `aria-controls` ensures any future refactor
 * that attempts to wire this <ul> as a controller for another region is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2641: stats-prev-week ul has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-controls")).toBe(false);
    expect(ul.getAttribute("aria-controls")).toBeNull();
  });
});
