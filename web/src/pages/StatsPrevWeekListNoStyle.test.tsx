import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2119: StatsPage's prev-week <ul data-testid="stats-prev-week"> intentionally
 * carries NO inline `style` attribute. Its visual presentation is owned
 * entirely by the `stats-week-list` / `stats-week-list--prev` CSS classes
 * (see StatsPage.tsx around line 1597), not by any inline style prop.
 *
 * Sibling pins on this same prev-week list lock the testid, the ul tagName
 * (W1605 — StatsPrevWeekListUlTag), the modifier class (W1592 —
 * StatsPrevWeekListPrevClass), child counts (W1647 / W1766 / W1772),
 * the absence of an explicit role attribute (W1806 —
 * StatsPrevWeekListNoRoleAttr), and the absence of a DOM `id` (W1987 —
 * StatsPrevWeekListNoId). What none of those cover is the ABSENCE of an
 * inline `style` attribute.
 *
 * A future refactor that introduced e.g. `style={{ display: "grid" }}`
 * or a JS-driven `style={{ "--prev-cols": cols }}` for layout/theming
 * would silently:
 *   1. Bypass the established stylesheet contract for this list, making
 *      theme/dark-mode/print overrides in the StatsPage CSS impossible
 *      to apply without `!important` workarounds.
 *   2. Couple the component's render output to per-render measurement
 *      logic, reintroducing layout-thrash patterns the current static
 *      class-only design specifically avoids.
 *   3. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app's deployment is free to adopt today precisely because
 *      the prev-week list carries no inline style.
 *
 * One focused assertion: the prev-week <ul> MUST NOT carry a `style`
 * attribute. Use `hasAttribute` rather than inspecting `.style.cssText`
 * — an empty `style=""` would still be a (broken) public surface that
 * future code or CSP-violation reporters could come to depend on, and
 * DOM `.style` reflection would silently mask its presence.
 */
describe("StatsPage stats-this-week — prev-week list style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2119: stats-prev-week <ul> has no style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // Sanity: confirm we pinned the prev-week ul itself (and not, say,
    // a wrapper div) before asserting absence of the style attribute.
    expect(prior.tagName).toBe("UL");
    // The actual contract: no inline `style` attribute on the prev-week list.
    expect(prior.hasAttribute("style")).toBe(false);
  });
});
