import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2597 — the LobbyPage `chip-favorites` Chip <button> MUST NOT carry an
 * `aria-label` attribute. The `<Chip>` helper (LobbyPage.tsx ~L2651)
 * derives its accessible name from its visible text children
 * ("Favorites") plus the badge count, so an explicit `aria-label` would
 * REPLACE rather than augment that text and silently strip the count
 * from screen-reader output.
 *
 * Sibling pins on `chip-favorites` already in the suite cover OTHER
 * attributes but NOT the `aria-label`-attribute absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-favorites.
 *   - LobbyChipFavoritesGlyphAria pins the heart glyph + `aria-hidden`.
 *   - LobbyChipFavoritesType pins the explicit `type="button"`.
 *   - LobbyChipFavoritesNoId pins the `id`-attribute absence.
 *   - LobbyChipFavoritesNoStyle pins the inline-`style`-attribute absence.
 *   - LobbyChipFavoritesNoAriaControls pins the `aria-controls`-attribute
 *     absence.
 *   - LobbyChipFavoritesRole pins `role="tab"`.
 *   - LobbyFavoritesChipBadgeZero pins the zero-count badge state.
 *
 * The `<Chip>` helper is shared, so a regression that introduced
 * `aria-label` on `chip-all` would fail other *Aria-style pins on
 * chip-all — but a regression that added `aria-label` to JUST the
 * favorites chip (e.g. via a future `aria-label` prop on the
 * heart-themed chip at LobbyPage.tsx ~L1943-1949) would slip through
 * every existing pin unless chip-favorites is independently pinned.
 * This file closes that gap on chip-favorites.
 *
 * Why the absence of `aria-label` matters here:
 *   1. The accessible name today is computed from the inner
 *      "Favorites" <span> plus the count badge, giving screen-reader
 *      users feedback like "Favorites 3". An `aria-label` would
 *      override that name, hiding the count.
 *   2. The visible "Favorites" label is locale-aware via
 *      `t("lobby.chip.favorites")`. A hard-coded English `aria-label`
 *      would desync from the visible label in non-English locales,
 *      violating WCAG 2.5.3 ("Label in Name").
 *   3. Pinning the absence preserves the option to keep the chip's
 *      accessible-name story driven entirely by its rendered children.
 *
 * Resolves the chip via its stable `data-testid="chip-favorites"`
 * (LobbyPage.tsx ~L1947) so the assertion is locale-independent and
 * immune to translation-key changes for `lobby.chip.favorites`.
 */
describe("LobbyPage — chip-favorites button has no aria-label attribute (W2597)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-favorites <button> does NOT carry an aria-label attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-favorites");

    // Sanity: confirm we pinned the actual chip-favorites <button>
    // wrapper and not a descendant span. A future restructure that
    // moved the testid down onto an inner glyph span could otherwise
    // pass this assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `aria-label` attribute on chip-favorites.
    // Use `hasAttribute` rather than reading `.getAttribute(...)` and
    // comparing to `null` — the former captures both the "missing" and
    // any future "explicitly empty" regressions in a single assertion.
    expect(chip.hasAttribute("aria-label")).toBe(false);
  });
});
