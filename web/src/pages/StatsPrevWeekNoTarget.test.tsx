import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2886: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only summary rows (Prior plays / Prior wins / Prior avg time) and
 * has no navigational, link, form, or browsing-context-targeting role.
 *
 * The HTML `target` attribute is meaningful on a small set of elements —
 * <a>, <area>, <base>, and <form> — where it controls which browsing
 * context (e.g. `_blank`, `_self`, `_parent`, `_top`, or a named frame)
 * receives the navigation or form submission. Applying `target` to a
 * <ul> is invalid HTML: the attribute is silently ignored by browsers,
 * but its presence:
 *   - misleads readers and tooling into thinking this list participates
 *     in navigation or framing semantics it does not own,
 *   - can confuse static analyzers, accessibility audits, and security
 *     scanners that look for `target="_blank"` without `rel="noopener"`,
 *   - signals that the element was repurposed (e.g. wrapped in or swapped
 *     for an anchor/form) and may indicate an unintended structural
 *     refactor of the weekly-stats card.
 *
 * Sibling tests already pin the absence of an enclosing anchor and of
 * `rel`, `popovertarget`, and a wide array of ARIA / global attributes
 * on this <ul>, but none pin the absence of the bare `target` attribute.
 * Pinning it here ensures any future refactor that tries to attach a
 * browsing-context target to this presentational list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — target attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2886: stats-prev-week ul has no target attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    // Use hasAttribute rather than value-equality so an empty
    // target="" (still a present attribute) would also fail.
    expect(ul.hasAttribute("target")).toBe(false);
    expect(ul.getAttribute("target")).toBeNull();
  });
});
