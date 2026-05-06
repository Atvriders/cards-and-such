import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2888: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" containing a static set of
 * summary rows (Prior plays / Prior wins / Prior avg time). The HTML
 * `rev` attribute is an obsolete reverse-link relation attribute that
 * was removed from HTML5; even on hyperlink elements where it once
 * applied (<a>, <link>) it is no longer recognised by modern browsers
 * and is rejected by HTML validators. Setting `rev` on a non-link
 * element such as this <ul> is doubly meaningless: it is both
 * semantically wrong for the element type and obsolete at the spec
 * level. Sibling contracts already pin a long list of attribute
 * absences on this <ul> (id, role, style, tabindex, dir, hidden,
 * inert, spellcheck, popover, popovertarget, anchor, rel, plus the
 * full aria-* surface), but `rev` is not yet pinned. Freezing `rev`
 * absence here guarantees the prior-week list never grows accidental
 * obsolete reverse-link metadata in a future refactor.
 */
describe("StatsPage stats-prev-week ul — rev attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2888: stats-prev-week ul has no rev attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("rev")).toBe(false);
  });
});
