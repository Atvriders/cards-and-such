import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2534 — the LobbyPage `chip-solitaire` Chip <button> MUST NOT carry an
 * inline `style` attribute. The Chip helper (LobbyPage.tsx ~L2651)
 * renders a `<button>` whose visual presentation is owned entirely by
 * the `.lobby-chip` / `.lobby-chip.is-active` CSS classes — no inline
 * `style` prop is forwarded onto the per-category chip wrapper.
 *
 * Sibling pins on `chip-solitaire` already in the suite cover OTHER
 * attributes but NOT the `style`-attribute absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-solitaire.
 *   - LobbySolitaireChipBadge (W1229) pins the count-badge text content.
 *   - LobbyDrawerEnter pins `chip-solitaire` aria-pressed activation.
 *   - LobbyChipFavoritesType / LobbyChipTopRatedType reference the
 *     chip-solitaire test id but do not pin its style attribute.
 *
 * The closest analogues are LobbyChipArcadeNoStyle (W2533) which pins
 * style-absence on `chip-arcade`, LobbyChipAllNoStyle (pins style-absence
 * on `chip-all`), and the family of *NoStyle pins on sibling
 * per-category chip surfaces (board, cards, dice). Because the `<Chip>`
 * helper is shared, a regression that introduced `style={{...}}` on
 * `chip-all` would fail W2146 — but a regression that added an inline
 * `style` to JUST the per-category chips (e.g. via the inline
 * `CATEGORY_ORDER.map` at LobbyPage.tsx ~L1964 passing an extra prop
 * only on the dynamic branch) would slip through every existing pin
 * unless every per-category chip is independently pinned. This file
 * closes that gap on chip-solitaire.
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
 * Resolves the chip via its stable `data-testid="chip-solitaire"`
 * (rendered through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970) so
 * the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-solitaire button has no inline style attribute (W2534)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-solitaire <button> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire");

    // Sanity: confirm we pinned the actual chip-solitaire <button>
    // wrapper and not a descendant span. A future restructure that moved
    // the testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `style` attribute on chip-solitaire. Use
    // `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could depend on, and DOM
    // `.style` reflection would silently mask its presence.
    expect(chip.hasAttribute("style")).toBe(false);
  });
});
