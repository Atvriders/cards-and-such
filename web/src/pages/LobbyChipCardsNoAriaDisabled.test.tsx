import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2615 — the LobbyPage `chip-cards` Chip <button> MUST NOT carry an
 * `aria-disabled` attribute. The Chip helper (LobbyPage.tsx ~L2651)
 * renders an always-enabled per-category filter chip — the cards
 * category is unconditionally available to every visitor, regardless
 * of whether the underlying catalog has any cards entries currently
 * surfaced. The chip's "selected" state is communicated via
 * `aria-pressed` / `aria-selected` toggle ARIA (already pinned by the
 * sibling LobbyChipCardsAriaPressedDefault and
 * LobbyChipCardsAriaSelectedDefault tests), NOT by `aria-disabled`.
 *
 * Sibling pins on `chip-cards` already in the suite cover OTHER
 * attributes but say nothing about `aria-disabled`:
 *   - LobbyChipCardsType pins the explicit `type="button"`.
 *   - LobbyChipCardsRole pins the role surface.
 *   - LobbyChipCardsNoId / NoStyle pin the `id` and `style` absences.
 *   - LobbyChipCardsNoAriaControls / NoAriaLabel pin two further
 *     ARIA-attribute absences but not the `aria-disabled` one.
 *   - LobbyChipCardsAriaPressedDefault and
 *     LobbyChipCardsAriaSelectedDefault pin the toggle-state defaults.
 *
 * Why the absence of `aria-disabled` matters here:
 *   1. Chip is a filter affordance — `aria-disabled="true"` would tell
 *      assistive tech the control is inert, breaking keyboard users'
 *      ability to toggle the cards filter even though the visual
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
 * Resolves the chip via its stable `data-testid="chip-cards"`
 * (rendered through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970)
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-cards button has no aria-disabled attribute (W2615)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-cards <button> does NOT carry an aria-disabled attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards");

    // Sanity: confirm we pinned the actual chip-cards <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `aria-disabled` attribute on chip-cards.
    // Use `hasAttribute` rather than inspecting the reflected
    // `ariaDisabled` IDL property — an `aria-disabled="false"` literal
    // would still be a (broken) public surface that future code or
    // axe-style auditors could observe, and IDL reflection can mask
    // an empty-string attribute presence.
    expect(chip.hasAttribute("aria-disabled")).toBe(false);
  });
});
