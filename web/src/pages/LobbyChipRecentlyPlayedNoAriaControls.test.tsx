import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2584 — the LobbyPage `chip-recently-played` Chip <button> MUST NOT
 * carry an `aria-controls` attribute. The shared Chip helper
 * (LobbyPage.tsx ~L2651-2666) emits exactly the following props on its
 * <button> wrapper:
 *
 *     <button
 *       type="button"
 *       role="tab"
 *       aria-selected={active}
 *       aria-pressed={active}
 *       className={`lobby-chip${active ? " is-active" : ""}`}
 *       onClick={onClick}
 *       data-testid={testId}
 *     >…</button>
 *
 * Notably absent — and load-bearing in its absence — is any
 * `aria-controls` association. The chip is `role="tab"` but it does NOT
 * declare which tabpanel it controls. That is intentional in this
 * codebase:
 *
 *   1. There is no single tabpanel id that the recently-played chip
 *      "owns" — the grid below the chip strip is a shared `lobby-grid`
 *      container that re-renders contents when the active filter
 *      changes (see LobbyPage.tsx ~L1216 / ~L1653 where `filter ===
 *      "recently-played"` reshapes the grid contents in-place), rather
 *      than multiple sibling tabpanels with separate ids being
 *      shown/hidden. Pointing `aria-controls` at a transient or shared
 *      id would lie to assistive tech about the relationship.
 *   2. Adding `aria-controls="lobby-grid"` (or similar) would make that
 *      grid id part of the chip's public ARIA contract — any future
 *      rename, restructure, or split of the grid surface would silently
 *      break the announced relationship without a test failing.
 *   3. The drawer-tablist surface (parallel category filter at
 *      LobbyPage.tsx ~L1832-1842, which threads `id="recently-played"`
 *      on its OWN tab element) DOES use `aria-controls`-style wiring on
 *      its own elements; mirroring that onto the chip strip would
 *      couple two independent navigation surfaces that the codebase has
 *      deliberately kept separate.
 *
 * Sibling pins on `chip-recently-played` already in the suite cover
 * OTHER attributes but NOT the `aria-controls` absence:
 *   - W2464 / LobbyChipRecentlyPlayedType pins `type="button"`.
 *   - W2485 / LobbyChipRecentlyPlayedNoId pins `id`-absence.
 *   - LobbyChipRecentlyPlayedRole pins `role="tab"`.
 *   - LobbyChipRecentlyPlayedNoStyle pins `style`-absence.
 *   - W1462 / LobbyChipRecentGlyphAria pins the glyph span's
 *     `aria-hidden="true"` and the literal `↺` text content.
 *   - W1175 / LobbyRecentlyPlayedChipBadgeZero pins the badge count
 *     text on a fresh-mount empty `cards-last-played` localStorage.
 *
 * None of those would catch a regression that added
 * `aria-controls={someId}` to the per-chip wrapper — e.g. via a
 * well-meaning a11y "fix" that wired the chip up to a grid id, or via
 * a copy-paste from the drawer-tablist surface. Sibling NoAriaControls
 * tests cover other chips — LobbyChipArcadeNoAriaControls,
 * LobbyChipBoardNoAriaControls, LobbyChipCardsNoAriaControls — but
 * `chip-recently-played` itself has no such pin. This file closes that
 * gap on chip-recently-played.
 *
 * Resolves the chip via its stable `data-testid="chip-recently-played"`
 * (rendered through `testId="chip-recently-played"` at LobbyPage.tsx
 * ~L1954) so the assertion is locale-independent and immune to
 * translation-key changes (`t("lobby.chip.recently_played")`).
 */
describe("LobbyPage — chip-recently-played button has no aria-controls attribute (W2584)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-recently-played <button> does NOT carry an aria-controls attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played");

    // Sanity: confirm we pinned the actual chip-recently-played <button>
    // wrapper and not a child span. Going through
    // `data-testid="chip-recently-played"` would resolve a child element
    // if any future refactor moved the testid down onto an inner span —
    // which would itself be a regression worth surfacing.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `aria-controls` attribute on
    // chip-recently-played. Use `hasAttribute` rather than checking for
    // null/empty — an `aria-controls=""` would still be a (broken)
    // public ARIA surface that screen readers and future code could
    // come to mis-handle, and `getAttribute("aria-controls")` returning
    // "" would silently pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("aria-controls")).toBe(false);
  });
});
