import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2132: The "Personal records by category" stats card
 * (`data-testid="stats-personal-records-by-category"`) MUST NOT carry
 * an inline `style` attribute. Its visual presentation is owned
 * entirely by the `.stats-card` CSS class and the surrounding
 * `.stats-card-grid` layout, not by any inline style prop.
 *
 * Existing sibling pins on this same card cover:
 *   - W1954 / StatsRecordsByCategoryTag.test.tsx — container tagName === "DIV".
 *   - W1464 / StatsSectionH2PRByCategoryParent.test.tsx — className+testid
 *     and h2 parent relationship.
 *   - W1296 / StatsPrByCatSubtitle.test.tsx — subtitle text + class hook.
 *   - W1333 / StatsPRByCatListClass.test.tsx — `<ul>` modifier class.
 *   - W1977 / StatsRecordsByCategoryH2Tag.test.tsx — h2 tagName.
 *   - W635  / StatsPage.test.tsx — row mapping from cards-best-times.
 *   - W2029 / StatsRecordsByCatCardNoId.test.tsx — absence of `id`.
 *
 * What none of those cover is the ABSENCE of an inline `style`
 * attribute on the card container. A future refactor that introduced
 * e.g. `style={{ display: "none" }}` for conditional collapse, a
 * JS-driven `style={{ "--accent": ... }}` custom-property override, or
 * a measurement-driven `style={{ minHeight: ... }}` would silently:
 *   1. Bypass the established `.stats-card` stylesheet contract,
 *      making theme/dark-mode/print overrides in CSS impossible to
 *      apply without `!important` workarounds.
 *   2. Couple the component's render output to per-render measurement
 *      logic (e.g., reading layout during render), reintroducing
 *      layout-thrash patterns the responsive grid design avoids.
 *   3. Defeat CSP `style-src` policies that disallow inline styles,
 *      which this app's deployment is free to adopt today precisely
 *      because this stats card carries no inline style.
 *
 * One focused assertion: the records-by-category card MUST NOT carry
 * a `style` attribute. If a future change deliberately needs inline
 * style (e.g., a CSS variable hook for accent color), it should add
 * the new attribute AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2029 / W1954 pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — personal records by category card has no inline style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2132: stats-personal-records-by-category card does NOT carry a style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");

    // Sanity: confirm we resolved the card container itself (a <div>
    // with the .stats-card class) and not some inner element a future
    // restructure could move the testid onto. Without this guard a
    // change that relocated the testid onto a styled child could pass
    // the absence-of-style assertion vacuously.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no `style` attribute on the card. Use
    // `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could come to depend on,
    // and DOM `.style` reflection would silently mask its presence.
    expect(card.hasAttribute("style")).toBe(false);
  });
});
