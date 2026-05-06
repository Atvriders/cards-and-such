import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2718 — the LobbyPage `chip-recently-played` Chip <button> MUST NOT
 * carry an explicit `tabindex` attribute. Native <button> elements are
 * already keyboard-focusable in document order; adding `tabindex="0"`
 * is redundant noise, and `tabindex="-1"` (or any positive value) would
 * actively break keyboard reachability / tab-order semantics for the
 * recently-played filter chip.
 *
 * Sibling pins on `chip-recently-played` already in the suite cover
 * OTHER attribute-absences but NOT `tabindex`-absence specifically:
 *   - LobbyChipRecentlyPlayedNoStyle (W2536) pins `style`-attribute
 *     absence.
 *   - LobbyChipRecentlyPlayedNoId (W2485) pins `id`-attribute absence.
 *   - LobbyChipRecentlyPlayedNoName pins `name`-attribute absence.
 *   - LobbyChipRecentlyPlayedNoForm pins `form`-attribute absence.
 *   - LobbyChipRecentlyPlayedNoValue pins `value`-attribute absence.
 *   - LobbyChipRecentlyPlayedNoAriaLabel / NoAriaControls /
 *     NoAriaDisabled pin various ARIA attribute absences.
 *   - LobbyChipRecentlyPlayedNoAutofocus pins `autofocus` absence.
 *   - LobbyChipRecentlyPlayedType pins explicit `type="button"`.
 *   - LobbyChipRecentlyPlayedRole pins the absence of any explicit
 *     role.
 *
 * The closest analogues are LobbyChipFavoritesNoTabindex (W2713) which
 * pins tabindex absence on the SIBLING favorites chip, plus
 * LobbyChipStripNoTabindex / LobbyChipsWrapNoTabindex which pin
 * tabindex absence on the strip wrapper / outer chips wrap. None of
 * those cover the per-chip <button> at `chip-recently-played`. Because
 * the `<Chip>` helper is shared, a regression that introduced
 * `tabIndex={0}` on JUST the recently-played chip (e.g. via a future
 * "make focusable on hover" prop on the clock-themed chip in
 * LobbyPage.tsx) would slip through every existing pin unless
 * chip-recently-played is independently pinned. This file closes that
 * gap.
 *
 * Why the absence of an explicit `tabindex` matters here:
 *   1. <button> is focusable by default — adding `tabindex="0"` is a
 *      well-known anti-pattern flagged by axe-core / lighthouse audits.
 *   2. A non-zero positive `tabindex` would yank chip-recently-played
 *      out of natural document tab order, breaking the strip's
 *      left-to-right keyboard navigation contract.
 *   3. `tabindex="-1"` would make the recently-played filter chip
 *      keyboard-unreachable, regressing the a11y story for sighted
 *      keyboard users.
 *
 * Resolves the chip via its stable `data-testid="chip-recently-played"`
 * so the assertion is locale-independent and immune to translation-key
 * changes for `lobby.chip.recentlyPlayed`.
 */
describe("LobbyPage — chip-recently-played button has no tabindex attribute (W2718)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-recently-played <button> does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played");

    // Sanity: confirm we pinned the actual chip-recently-played <button>
    // wrapper and not a descendant span. A future restructure that moved
    // the testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (most spans also have no tabindex).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `tabindex` attribute on
    // chip-recently-played. Use `hasAttribute` rather than inspecting
    // `.tabIndex` — a stray `tabindex=""` (or any explicit value) would
    // still be a public surface, and the DOM `.tabIndex` IDL property
    // defaults to 0 for <button> regardless, which would silently mask
    // attribute presence.
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
