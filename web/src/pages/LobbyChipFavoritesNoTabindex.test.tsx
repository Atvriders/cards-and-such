import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2713 — the LobbyPage `chip-favorites` Chip <button> MUST NOT carry an
 * explicit `tabindex` attribute. Native <button> elements are already
 * keyboard-focusable in document order; adding `tabindex="0"` is
 * redundant noise, and `tabindex="-1"` (or any positive value) would
 * actively break keyboard reachability / tab-order semantics for the
 * favorites filter chip.
 *
 * Sibling pins on `chip-favorites` already in the suite cover OTHER
 * attribute-absences but NOT `tabindex`-absence specifically:
 *   - LobbyChipFavoritesNoStyle (W2531) pins `style`-attribute absence.
 *   - LobbyChipFavoritesNoId pins `id`-attribute absence.
 *   - LobbyChipFavoritesNoName pins `name`-attribute absence.
 *   - LobbyChipFavoritesNoForm pins `form`-attribute absence.
 *   - LobbyChipFavoritesNoValue pins `value`-attribute absence.
 *   - LobbyChipFavoritesNoAriaLabel / NoAriaControls / NoAriaDisabled
 *     pin various ARIA attribute absences.
 *   - LobbyChipFavoritesNoAutofocus pins `autofocus` absence.
 *   - LobbyChipFavoritesType pins explicit `type="button"`.
 *   - LobbyChipFavoritesRole pins the absence of any explicit role.
 *
 * The closest analogues are LobbyChipStripNoTabindex (pins tabindex
 * absence on the strip wrapper) and LobbyChipsWrapNoTabindex (pins
 * tabindex absence on the outer chips wrap). Neither covers the
 * per-chip <button> at `chip-favorites`. Because the `<Chip>` helper
 * is shared, a regression that introduced `tabIndex={0}` on JUST the
 * favorites chip (e.g. via a future "make focusable on hover" prop on
 * the heart-themed chip at LobbyPage.tsx ~L1943-1949) would slip
 * through every existing pin unless chip-favorites is independently
 * pinned. This file closes that gap.
 *
 * Why the absence of an explicit `tabindex` matters here:
 *   1. <button> is focusable by default — adding `tabindex="0"` is a
 *      well-known anti-pattern flagged by axe-core / lighthouse audits.
 *   2. A non-zero positive `tabindex` would yank chip-favorites out of
 *      natural document tab order, breaking the strip's left-to-right
 *      keyboard navigation contract.
 *   3. `tabindex="-1"` would make the favorites filter chip
 *      keyboard-unreachable, regressing the a11y story for sighted
 *      keyboard users.
 *
 * Resolves the chip via its stable `data-testid="chip-favorites"`
 * (LobbyPage.tsx ~L1947) so the assertion is locale-independent and
 * immune to translation-key changes for `lobby.chip.favorites`.
 */
describe("LobbyPage — chip-favorites button has no tabindex attribute (W2713)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-favorites <button> does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-favorites");

    // Sanity: confirm we pinned the actual chip-favorites <button>
    // wrapper and not a descendant span. A future restructure that moved
    // the testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (most spans also have no tabindex).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `tabindex` attribute on chip-favorites.
    // Use `hasAttribute` rather than inspecting `.tabIndex` — a stray
    // `tabindex=""` (or any explicit value) would still be a public
    // surface, and the DOM `.tabIndex` IDL property defaults to 0 for
    // <button> regardless, which would silently mask attribute presence.
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
