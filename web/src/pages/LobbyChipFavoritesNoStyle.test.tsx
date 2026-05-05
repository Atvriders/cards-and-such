import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2531 — the LobbyPage `chip-favorites` Chip <button> MUST NOT carry an
 * inline `style` attribute. The Chip helper (LobbyPage.tsx ~L2651)
 * renders a `<button>` whose visual presentation is owned entirely by
 * the `.lobby-chip` / `.lobby-chip.is-active` CSS classes — no inline
 * `style` prop is forwarded onto the per-category chip wrapper.
 *
 * Sibling pins on `chip-favorites` already in the suite cover OTHER
 * attributes but NOT the `style`-attribute absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-favorites.
 *   - LobbyChipFavoritesGlyphAria pins the heart glyph + `aria-hidden`.
 *   - LobbyChipFavoritesType pins the explicit `type="button"`.
 *   - LobbyChipFavoritesNoId pins the `id`-attribute absence.
 *   - LobbyFavoritesChipBadgeZero pins the zero-count badge state.
 *
 * The closest analogues are W2146 / LobbyChipAllNoStyle (pins
 * style-absence on `chip-all`), W2519 / LobbyChipBoardNoStyle (pins
 * chip-board) and the family of *NoStyle pins on sibling chip surfaces.
 * Because the `<Chip>` helper is shared, a regression that introduced
 * `style={{...}}` on `chip-all` would fail W2146 — but a regression that
 * added an inline `style` to JUST the favorites chip (e.g. via a future
 * `style={{ color: "red" }}` prop on the heart-themed chip at
 * LobbyPage.tsx ~L1943-1949) would slip through every existing pin
 * unless chip-favorites is independently pinned. This file closes that
 * gap on chip-favorites.
 *
 * Why the absence of an inline `style` matters here:
 *   1. The `.lobby-chip` stylesheet contract is the single source of
 *      visual truth — an inline `style` would force theme / dark-mode
 *      overrides to escalate to `!important` to win.
 *   2. Per-render inline styles couple Chip output to measurement
 *      logic, reintroducing layout-thrash patterns the strip-level
 *      scroll design specifically avoids via refs + event listeners.
 *   3. CSP `style-src` policies that disallow `'unsafe-inline'` styles
 *      remain available to this app precisely because Chip emits no
 *      inline style today — pinning the absence preserves that option.
 *
 * Resolves the chip via its stable `data-testid="chip-favorites"`
 * (LobbyPage.tsx ~L1947) so the assertion is locale-independent and
 * immune to translation-key changes for `lobby.chip.favorites`.
 */
describe("LobbyPage — chip-favorites button has no inline style attribute (W2531)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-favorites <button> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-favorites");

    // Sanity: confirm we pinned the actual chip-favorites <button>
    // wrapper and not a descendant span. A future restructure that moved
    // the testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `style` attribute on chip-favorites. Use
    // `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could depend on, and DOM
    // `.style` reflection would silently mask its presence.
    expect(chip.hasAttribute("style")).toBe(false);
  });
});
