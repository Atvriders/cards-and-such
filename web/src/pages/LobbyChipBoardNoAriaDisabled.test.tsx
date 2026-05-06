import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2616 — the `chip-board` button (the per-category board chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) MUST NOT carry an `aria-disabled` attribute in its
 * current shape. The chip is a fully interactive `role="tab"` (pinned by
 * W2555 in LobbyChipBoardRole.test.tsx) inside a `role="tablist"` chip-strip
 * and is always enabled — clicking it switches the active filter category
 * via `aria-selected` (pinned by W2523 in
 * LobbyChipBoardAriaSelectedDefault.test.tsx). The lobby never disables a
 * category chip; even when the resulting filter would yield zero tiles,
 * the chip still needs to be activatable so users can toggle the filter
 * back off.
 *
 * `aria-disabled="true"` (or even an explicit `aria-disabled="false"`)
 * would mislead AT into announcing the chip as inactive or surfacing it
 * with diminished interactivity in screen-reader rotors. The native
 * `disabled` property is also intentionally absent (the chip is wired
 * for click handling), so a stray `aria-disabled` would create an even
 * worse mismatch — visually clickable, programmatically clickable, but
 * announced as disabled. Pinning the literal markup absence here closes
 * the loop on the chip side: a regression that pre-emptively added
 * `aria-disabled` to the shared `Chip` helper would break the AT
 * contract, while every existing sibling pin (selected/role/type/etc.)
 * would still pass.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `aria-disabled` to ANY chip
 *    today, but no existing test reads `hasAttribute("aria-disabled")` on
 *    the `chip-board` button specifically. Sibling files such as
 *    LobbyChipBoardRole.test.tsx (W2555),
 *    LobbyChipBoardAriaSelectedDefault.test.tsx (W2523),
 *    LobbyChipBoardAriaPressedDefault.test.tsx,
 *    LobbyChipBoardType.test.tsx (W2473),
 *    LobbyChipBoardNoAriaControls.test.tsx (W2579),
 *    LobbyChipBoardNoAriaLabel.test.tsx,
 *    LobbyChipBoardNoId.test.tsx and
 *    LobbyChipBoardNoStyle.test.tsx (W2519) all fetch the chip via
 *    `data-testid="chip-board"` but each pins a different attribute.
 *  - LobbyDrawerToggleNoDisabled.test.tsx pins the absence of the native
 *    `disabled` property on a sibling surface (the drawer toggle) but
 *    does not cover chip-board nor the ARIA-flavored `aria-disabled`
 *    attribute, so a branch that special-cased the board chip with an
 *    `aria-disabled` would slip past every existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-board"` (the
 * testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `hasAttribute("aria-disabled")` to pin the literal
 * markup absence — confirming the attribute is not present at all,
 * rather than checking for a particular value (which would still pass
 * for an explicit `aria-disabled="false"` that reacts in AT differently
 * from the attribute being missing entirely).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-board test) mirrors the established
 * per-surface-attribute pattern (e.g. W2579 in
 * LobbyChipBoardNoAriaControls.test.tsx) so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-board has no aria-disabled attribute (W2616)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-board without an aria-disabled attribute (chip is always interactive)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-board") as HTMLButtonElement;

    // The chip is always interactive — toggling its filter is the whole
    // point of the chip-strip. `hasAttribute` reads the literal markup
    // so a regression that adds `aria-disabled` (with any value, even
    // "false") fails here with a clear diff.
    expect(chip.hasAttribute("aria-disabled")).toBe(false);
  });
});
