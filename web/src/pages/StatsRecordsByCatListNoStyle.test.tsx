import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2187: The <ul> rendered inside the "Personal records by category"
 * stats card carries the `stats-pr-list stats-pr-list--by-cat` class
 * pair (pinned by W1333) and no `id` attribute (pinned by W2108), and
 * the surrounding card div has no inline `style` attribute (pinned by
 * W2132). What is NOT yet pinned is the absence of an inline `style`
 * attribute on the `<ul>` list element itself.
 *
 * The list's visual presentation — row layout, empty-row dimming via
 * `li[data-empty="true"]`, per-category rank-column sizing, gap and
 * padding — is owned entirely by the `.stats-pr-list` and
 * `.stats-pr-list--by-cat` CSS rules in StatsPage.css. A future
 * refactor that introduced e.g. `style={{ gap: ... }}` for a
 * JS-computed spacing value, `style={{ "--row-count": ... }}` for a
 * CSS-variable count hook, or `style={{ minHeight: ... }}` from a
 * measurement-driven layout pass would silently:
 *   1. Bypass the established `.stats-pr-list--by-cat` stylesheet
 *      contract, making theme/dark-mode/print overrides in CSS
 *      impossible to apply without `!important` workarounds.
 *   2. Couple the component's render output to per-render measurement
 *      logic (e.g., reading layout during render), reintroducing
 *      layout-thrash patterns the responsive grid design avoids.
 *   3. Defeat CSP `style-src` policies that disallow inline styles,
 *      which this app's deployment is free to adopt today precisely
 *      because this list carries no inline style.
 *
 * Sibling pin W2132 (StatsRecordsByCatCardNoStyle) covers the card
 * <div>; this test extends the same contract one level inward to the
 * <ul>. Use `hasAttribute("style")` rather than inspecting
 * `.style.cssText` — an empty `style=""` would still be a (broken)
 * public surface that future code or CSP-violation reporters could
 * come to depend on, and DOM `.style` reflection would silently mask
 * its presence.
 */
describe("StatsPage — personal records by category list has no inline style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2187: stats-personal-records-by-category list does NOT carry a style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");
    const list = within(card).getByRole("list");

    // Sanity: confirm we resolved the by-cat <ul> itself (carrying the
    // pinned class pair from W1333) and not some inner element a
    // future restructure could move list-role onto. Without this guard
    // a change that wrapped the rows in a styled element could pass
    // the absence-of-style assertion vacuously.
    expect(list.tagName).toBe("UL");
    expect(list.classList.contains("stats-pr-list--by-cat")).toBe(true);

    // The actual contract: no `style` attribute on the list.
    expect(list.hasAttribute("style")).toBe(false);
  });
});
