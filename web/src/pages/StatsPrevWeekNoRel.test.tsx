import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2883: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" containing a static set of
 * summary rows (Prior plays / Prior wins / Prior avg time). The HTML
 * `rel` attribute belongs on hyperlink-bearing elements (<a>, <area>,
 * <link>, <form>) where it expresses the relationship between the
 * current document and a linked resource (e.g. "noopener", "noreferrer",
 * "nofollow", "stylesheet"). Setting `rel` on a non-link element such as
 * this <ul> is semantically meaningless, ignored by browsers for link
 * relation purposes, but still surfaces to assistive tech and accessibility
 * tooling as an unexpected attribute, and can mask real bugs where a
 * developer mistakenly believed the prior-week list was rendered as an
 * anchor or contained navigation semantics. Sibling contracts already
 * pin a long list of attribute absences on this <ul> (id, role, style,
 * tabindex, dir, hidden, inert, spellcheck, popover, popovertarget,
 * anchor, plus the full aria-* surface), but `rel` is not yet pinned.
 * Freezing `rel` absence here guarantees the prior-week list never
 * grows accidental link-relation metadata in a future refactor.
 */
describe("StatsPage stats-prev-week ul — rel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2883: stats-prev-week ul has no rel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("rel")).toBe(false);
  });
});
