import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2828: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only, non-editable summary rows (Prior plays / Prior wins / Prior
 * avg time). Sibling structural contracts already pin class names, child
 * counts, label/value tags, and the absence of `id`, `role`, inline
 * `style`, `tabindex`, `dir`, `spellcheck`, and ARIA attributes on this
 * <ul>, but no existing test pins the absence of the `contenteditable`
 * attribute. Adding `contenteditable="true"` (or even `"false"`) on this
 * non-editable list would mark the subtree as editable text to browsers
 * and assistive technologies, allowing users to mutate the rendered
 * statistics in place, triggering caret/IME behavior, and breaking the
 * read-only contract of the prior-week summary. Pinning the absence of
 * `contenteditable` ensures any future refactor that opts this subtree
 * into edit semantics is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — contenteditable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2828: stats-prev-week ul has no contenteditable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("contenteditable")).toBe(false);
    expect(ul.getAttribute("contenteditable")).toBeNull();
  });
});
