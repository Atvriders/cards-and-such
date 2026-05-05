import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2536 — the LobbyPage `chip-recently-played` Chip <button> MUST NOT
 * carry an inline `style` attribute. The shared Chip helper
 * (LobbyPage.tsx ~L2651) renders a `<button>` whose visual presentation
 * is owned entirely by the `.lobby-chip` / `.lobby-chip.is-active` CSS
 * classes — no inline `style` prop is forwarded onto the per-category
 * chip wrapper at LobbyPage.tsx ~L1954.
 *
 * Sibling pins on `chip-recently-played` already in the suite cover
 * OTHER attributes but NOT the `style`-attribute absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-recently-played in the chip-strip sweep.
 *   - W1462 / LobbyChipRecentGlyphAria pins the glyph span's
 *     `aria-hidden="true"` and the literal `↺` text content.
 *   - W1175 / LobbyRecentlyPlayedChipBadgeZero pins the badge count
 *     text on a fresh-mount empty `cards-last-played` localStorage.
 *   - W2464 / LobbyChipRecentlyPlayedType pins the explicit
 *     `type="button"` attribute.
 *   - W2485 / LobbyChipRecentlyPlayedNoId pins the `id`-attribute
 *     absence.
 *   - LobbyPage.test.tsx ~L2182 pins `aria-pressed` toggling on click.
 *   - LobbyRecentlyPlayedOrder.test.tsx pins `aria-pressed` after a
 *     filter-driven reorder.
 *
 * The closest analogues are W2531 / LobbyChipFavoritesNoStyle,
 * W2519 / LobbyChipBoardNoStyle, and the family of *NoStyle pins on
 * sibling chip surfaces (chip-all, chip-arcade, chip-cards, chip-dice,
 * chip-solitaire). Because the `<Chip>` helper is shared, a regression
 * that introduced `style={{...}}` on `chip-all` would fail W2146 — but
 * a regression that added an inline `style` to JUST the
 * recently-played chip (e.g. via a future
 * `style={{ animationDelay: `${idx * 50}ms` }}` prop on the
 * recently-played chip wrapper at LobbyPage.tsx ~L1950-1956 to stagger
 * chip-strip entrance animations) would slip through every existing
 * chip-recently-played pin because none of W1962 / W1462 / W1175 /
 * W2464 / W2485 reads the `style` attribute.
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
 * Resolves the chip via its stable `data-testid="chip-recently-played"`
 * (LobbyPage.tsx ~L1954) so the assertion is locale-independent and
 * immune to translation-key changes for `lobby.chip.recentlyPlayed`.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * follows the W2485 / W2531 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-recently-played button has no inline style attribute (W2536)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-recently-played <button> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played");

    // Sanity: confirm we pinned the actual chip-recently-played <button>
    // wrapper and not a descendant span. A future restructure that moved
    // the testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `style` attribute on chip-recently-played.
    // Use `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could depend on, and DOM
    // `.style` reflection would silently mask its presence.
    expect(chip.hasAttribute("style")).toBe(false);
  });
});
