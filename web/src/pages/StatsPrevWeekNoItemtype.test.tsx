import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2874: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" containing three read-only
 * summary rows (Prior plays / Prior wins / Prior avg time). The HTML
 * `itemtype` global attribute is part of the Microdata vocabulary and is
 * meaningful only when paired with `itemscope`; on its own (or even
 * combined) it instructs crawlers and structured-data parsers to treat
 * the element as a typed Microdata item belonging to the named vocabulary.
 * Attaching `itemtype` to this <ul> would silently advertise the prior-week
 * stats as a structured-data record (e.g. schema.org type), polluting any
 * Microdata extraction with a non-typed presentational list of inline
 * counts and biasing crawler interpretation of the page. Sibling absence
 * contracts already pin many other unwanted globals on this <ul>
 * (popover, inert, hidden, dir, spellcheck, tabindex, role, id, style,
 * aria-* family, etc.), but `itemtype` absence is not yet pinned. Pinning
 * it ensures any future change that attempts to attach Microdata typing
 * to this presentational list is reviewed deliberately rather than
 * leaking schema.org assertions into the prior-week summary.
 */
describe("StatsPage stats-prev-week ul — itemtype attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2874: stats-prev-week ul has no itemtype attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("itemtype")).toBe(false);
  });
});
