import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2836: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only summary rows (Prior plays / Prior wins / Prior avg time) and is
 * not an editable text input or contenteditable surface. The HTML
 * `inputmode` attribute is a hint to user agents about which virtual
 * keyboard layout to display when the element is being edited (e.g.
 * "numeric", "decimal", "tel"). Applying it to a non-editable <ul> is
 * meaningless, may confuse assistive technology, and on some mobile
 * browsers can cause spurious on-screen keyboard activations when the
 * element receives focus. Sibling structural contracts pin many absences
 * on this <ul> (id, role, style, tabindex, dir, hidden, inert,
 * spellcheck, lang, contenteditable, translate, and a long list of
 * aria-* attributes), but the absence of `inputmode` is not yet pinned.
 * Pinning `inputmode` absence ensures any future refactor that attempts
 * to add a virtual-keyboard hint to the prior-week list is reviewed
 * deliberately rather than slipping in silently.
 */
describe("StatsPage stats-prev-week ul — inputmode attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2836: stats-prev-week ul has no inputmode attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("inputmode")).toBe(false);
  });
});
