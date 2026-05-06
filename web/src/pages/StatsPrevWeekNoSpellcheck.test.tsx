import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2737: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only, non-editable summary rows (Prior plays / Prior wins / Prior
 * avg time). Sibling structural contracts already pin class names, child
 * counts, label/value tags, and the absence of `id`, `role`, inline
 * `style`, `tabindex`, `dir`, and ARIA attributes on this <ul>, but no
 * existing test pins the absence of the `spellcheck` attribute. Adding
 * `spellcheck="true"` or `spellcheck="false"` on a non-editable list is
 * meaningless at best and at worst signals to assistive technologies and
 * browser tooling that the subtree is editable text — confusing screen
 * readers and potentially triggering unwanted browser-level spell-check
 * decoration on the numeric summary values. Pinning the absence of
 * `spellcheck` ensures any future refactor that opts this subtree into
 * spell-check semantics is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — spellcheck attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2737: stats-prev-week ul has no spellcheck attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("spellcheck")).toBe(false);
    expect(ul.getAttribute("spellcheck")).toBeNull();
  });
});
