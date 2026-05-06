import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2831: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". It is a presentational list of read-only
 * summary rows (Plays / Wins / Avg time) for the current week. Sibling
 * structural contracts already pin tagName, classes, child counts,
 * label/value tags, and the absence of `id`, `role`, inline `style`,
 * `tabindex`, `dir`, `spellcheck`, `hidden`, `translate`, and a wide
 * range of ARIA attributes on this <ul> — but no existing test pins
 * the absence of the `contenteditable` attribute. Adding
 * `contenteditable="true"` (or even `"false"`) on this non-editable list
 * would mark the subtree as editable text to browsers and assistive
 * technologies, allowing users to mutate the rendered statistics in
 * place, triggering caret/IME behavior, and breaking the read-only
 * contract of the current-week summary. Pinning the absence of
 * `contenteditable` ensures any future refactor that opts this subtree
 * into edit semantics is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — contenteditable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2831: stats-this-week-list <ul> has no contenteditable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.tagName).toBe("UL");
    // No contenteditable — the list is presentational and its rows are
    // read-only summary stats, not editable text.
    expect(list.hasAttribute("contenteditable")).toBe(false);
    expect(list.getAttribute("contenteditable")).toBeNull();
  });
});
