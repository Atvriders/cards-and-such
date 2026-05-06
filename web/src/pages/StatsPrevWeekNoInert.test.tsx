import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2810: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only summary rows (Prior plays / Prior wins / Prior avg time) that
 * users must always be able to read with assistive technology and interact
 * with via pointer/keyboard. The HTML `inert` attribute, when present on an
 * element, removes that element and its subtree from the accessibility tree,
 * blocks pointer events, and excludes its descendants from sequential focus
 * navigation. Adding `inert` (even silently) to this list would silently
 * break screen-reader access to the previous-week stats and visually hide
 * focus/selection affordances on its rows. Sibling structural contracts pin
 * many absences on this <ul> (id, role, style, tabindex, dir, hidden,
 * spellcheck, lang, and a long list of aria-* attributes), but the absence
 * of `inert` is not yet pinned. Pinning `inert` absence ensures any future
 * refactor that attempts to make the prior-week list inert is reviewed
 * deliberately rather than slipping in silently and degrading accessibility.
 */
describe("StatsPage stats-prev-week ul — inert attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2810: stats-prev-week ul has no inert attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("inert")).toBe(false);
  });
});
