import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2593 — the LobbyPage `chip-all` Chip <button> MUST NOT carry an
 * `aria-controls` attribute. The Chip helper (LobbyPage.tsx ~L2651-2666)
 * emits exactly the following props on its <button> wrapper:
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
 *   1. There is no single tabpanel id that the "all" chip "owns" — the
 *      grid below the chip strip is a shared `lobby-grid` container that
 *      re-renders contents when the active filter changes, rather than
 *      multiple sibling tabpanels with separate ids being shown/hidden.
 *      Pointing `aria-controls` at a transient or shared id would lie to
 *      assistive tech about the relationship.
 *   2. Adding `aria-controls="lobby-grid"` (or similar) would make that
 *      grid id part of the chip's public ARIA contract — any future
 *      rename, restructure, or split of the grid surface would silently
 *      break the announced relationship without a test failing.
 *   3. The drawer-tablist surface (parallel category filter) DOES use
 *      `aria-controls`-style wiring on its own elements; mirroring that
 *      onto the chip strip would couple two independent navigation
 *      surfaces that the codebase has deliberately kept separate.
 *
 * Sibling pins on `chip-all` already in the suite cover OTHER attributes
 * but NOT the `aria-controls` absence:
 *   - W1258 / LobbyChipType pins `type="button"` on chip-all.
 *   - W2414 / LobbyChipAllNoId pins `id`-absence.
 *   - W2146 / LobbyChipAllNoStyle pins inline `style` absence.
 *   - LobbyChipAllRole pins `role="tab"`.
 *   - W608 / W2415 in LobbyPage.test.tsx pin `aria-pressed` /
 *     `aria-selected`.
 *
 * None of those would catch a regression that added
 * `aria-controls={someId}` to the "all" chip wrapper — e.g. via the
 * inline render at LobbyPage.tsx ~L1935 forwarding an extra prop only
 * on the all-filter branch. This file closes that gap on chip-all,
 * mirroring the W2581 / LobbyChipArcadeNoAriaControls pin that already
 * exists for the per-category arcade chip.
 *
 * Resolves the chip via its stable `data-testid="chip-all"` (rendered
 * through `testId="chip-all"` at LobbyPage.tsx ~L1935) so the assertion
 * is locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-all button has no aria-controls attribute (W2593)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-all <button> does NOT carry an aria-controls attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all");

    // Sanity: confirm we pinned the actual chip-all <button> wrapper and
    // not a child span. Going through `data-testid="chip-all"` would
    // resolve a child element if any future refactor moved the testid
    // down onto an inner span — which would itself be a regression worth
    // surfacing.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `aria-controls` attribute on chip-all.
    // Use `hasAttribute` rather than checking for null/empty — an
    // `aria-controls=""` would still be a (broken) public ARIA surface
    // that screen readers and future code could come to mis-handle, and
    // `getAttribute("aria-controls")` returning "" would silently pass
    // a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("aria-controls")).toBe(false);
  });
});
