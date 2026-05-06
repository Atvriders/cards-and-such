import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2851: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only summary rows (Prior plays / Prior wins / Prior avg time) that
 * is always visible inline within the StatsPage layout. The HTML `popover`
 * global attribute, when present on an element, turns that element into a
 * top-layer popover that is hidden by default and only shown via popover
 * invokers or the showPopover() API. Adding `popover` (even silently) to
 * this list would cause the prior-week stats to disappear from the page
 * entirely until explicitly invoked, breaking the always-visible contract
 * users rely on. Sibling structural contracts pin many absences on this
 * <ul> (id, role, style, tabindex, dir, hidden, inert, spellcheck, and a
 * long list of aria-* attributes), but the absence of `popover` is not yet
 * pinned. Pinning `popover` absence ensures any future refactor that
 * attempts to make the prior-week list a popover is reviewed deliberately
 * rather than slipping in silently and hiding the prior-week summary.
 */
describe("StatsPage stats-prev-week ul — popover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2851: stats-prev-week ul has no popover attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("popover")).toBe(false);
  });
});
