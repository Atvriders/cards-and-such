import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2623 — the LobbyPage `chip-dice` Chip <button> MUST NOT carry an
 * `aria-disabled` attribute. The Chip helper (LobbyPage.tsx ~L2651)
 * renders an always-enabled per-category filter chip — the dice
 * category is unconditionally available to every visitor, regardless
 * of whether the underlying catalog has any dice entries currently
 * surfaced. The chip's "selected" state is communicated via
 * `aria-pressed` / `aria-selected` toggle ARIA (already pinned by the
 * sibling LobbyChipDiceAriaPressedDefault test), NOT by
 * `aria-disabled`.
 *
 * Sibling pins on `chip-dice` already in the suite cover OTHER
 * attributes but say nothing about `aria-disabled`:
 *   - LobbyChipDiceRole pins the role surface (W2554).
 *   - LobbyChipDiceNoAriaLabel pins the `aria-label` absence (W2603).
 *   - LobbyChipDiceAriaPressedDefault pins the toggle default (W2505).
 *   - LobbyChipDiceNoId pins the `id` absence (W2429).
 *
 * Sibling chips already pin the `aria-disabled` absence on their own
 * surfaces (LobbyChipArcadeNoAriaDisabled, LobbyChipBoardNoAriaDisabled,
 * LobbyChipCardsNoAriaDisabled (W2615), LobbyChipFavoritesNoAriaDisabled),
 * leaving `chip-dice` as the conspicuous gap that this file fills.
 *
 * Why the absence of `aria-disabled` matters here:
 *   1. Chip is a filter affordance — `aria-disabled="true"` would tell
 *      assistive tech the control is inert, breaking keyboard users'
 *      ability to toggle the dice filter even though the visual
 *      hover/focus styling implies it is interactive.
 *   2. `aria-disabled` interacts subtly with `aria-pressed` toggle
 *      semantics: a disabled toggle button is generally treated by AT
 *      as "this state cannot change", which directly conflicts with
 *      the chip's selectable design.
 *   3. CSS that targets `[aria-disabled]` (a common pattern in design
 *      systems for "muted" styling) would unintentionally apply to the
 *      chip if a regression added the attribute. Pinning its absence
 *      keeps the `.lobby-chip` stylesheet contract intact.
 *
 * Resolves the chip via its stable `data-testid="chip-dice"`
 * (rendered through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970)
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-dice button has no aria-disabled attribute (W2623)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-dice <button> does NOT carry an aria-disabled attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-dice");

    // Sanity: confirm we pinned the actual chip-dice <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `aria-disabled` attribute on chip-dice.
    // Use `hasAttribute` rather than inspecting the reflected
    // `ariaDisabled` IDL property — an `aria-disabled="false"` literal
    // would still be a (broken) public surface that future code or
    // axe-style auditors could observe, and IDL reflection can mask
    // an empty-string attribute presence.
    expect(chip.hasAttribute("aria-disabled")).toBe(false);
  });
});
