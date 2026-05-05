import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2125 — StatsPage's `stats-personal-records` <div> card (the per-game
 * "Top 10 best times across all games" panel rendered around line 1616 of
 * StatsPage.tsx) MUST NOT carry an inline `style` attribute. Its visual
 * presentation — padding, border, radius, theme background, dark-mode
 * overrides — is owned entirely by the `.stats-card` class hook in the
 * stylesheet, identical to every other card on the page.
 *
 * Sibling pins on this same `stats-personal-records` card already cover:
 *   - StatsPersonalRecordsWrapClass.test.tsx — exact `stats-card` className
 *   - StatsPersonalRecordsNoId.test.tsx — ABSENCE of an `id` attribute
 *   - StatsPersonalRecordsTitleClass.test.tsx — heading className
 *   - StatsPersonalRecordsSubtitleTag.test.tsx — subtitle <p> tagName
 *   - StatsPersonalRecordsSubtitleClass.test.tsx — subtitle className
 *   - StatsPersonalRecordsSubtitleText.test.tsx — subtitle copy
 *   - StatsPersonalRecordsEmptyNoUl.test.tsx — empty-state copy
 *   - StatsSectionH2PersonalRecordsParent.test.tsx — H2 parent linkage
 *
 * What none of those pin is the ABSENCE of an inline `style` attribute on
 * the card's outer <div>. A future refactor that introduced a per-render
 * `style={{ ... }}` prop on this card — e.g. a JS-computed
 * `gridColumn: "span 2"` for a wide-table desktop variant, a
 * `maxHeight` for in-card scrolling, or an inline background color
 * override for a "fresh PR" highlight — would silently:
 *   1. Raise CSS specificity above the established `.stats-card`
 *      stylesheet rule, making theme / dark-mode / print overrides in
 *      CSS impossible to apply without `!important` workarounds, and
 *      silently breaking visual parity with the other ten card siblings
 *      on the same `.stats-card-grid`.
 *   2. Couple the card render output to per-render measurement or state
 *      logic, reintroducing layout-thrash patterns the current
 *      class-only design specifically avoids by deferring all sizing
 *      to the responsive grid container.
 *   3. Defeat CSP `style-src` policies that disallow inline styles —
 *      the deployment is free to adopt those today precisely because
 *      this card (and its siblings) carries no inline style.
 *
 * One focused assertion: the `stats-personal-records` <div> MUST NOT
 * carry a `style` attribute. If a future change deliberately needs an
 * inline style (e.g., a JS-driven layout span variant), it should add
 * the new attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2102 / W2116 NoStyle pattern so the test shares the
 * `src/pages/StatsPersonalRecords` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("StatsPage stats-personal-records card has no inline style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2125: stats-personal-records card has no style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The card is the <div> advertising `data-testid="stats-personal-records"`.
    // Use `hasAttribute("style")` rather than inspecting `.style.cssText` —
    // an empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could come to depend on,
    // and DOM `.style` reflection would silently mask its presence.
    const card = screen.getByTestId("stats-personal-records");
    expect(card.tagName.toLowerCase()).toBe("div");
    expect(card.hasAttribute("style")).toBe(false);
  });
});
