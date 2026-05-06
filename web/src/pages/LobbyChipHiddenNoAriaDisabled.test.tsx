import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2630 — the `chip-hidden` button (the "Hidden" filter chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx around line 1957) MUST NOT carry an `aria-disabled`
 * attribute in its current shape. The chip is a fully interactive
 * `role="tab"` (pinned by W2566 in LobbyChipHiddenRole.test.tsx) inside
 * a `role="tablist"` chip-strip and is always enabled — clicking it
 * switches the active filter to surface games the user has hidden via
 * `setFilter("hidden")`. The lobby never disables this chip; even when
 * `hiddenCount === 0` and the resulting filter would yield zero tiles,
 * the chip still needs to be activatable so users can toggle the filter
 * back off and inspect/restore hidden entries.
 *
 * `aria-disabled="true"` (or even an explicit `aria-disabled="false"`)
 * would mislead AT into announcing the chip as inactive or surfacing it
 * with diminished interactivity in screen-reader rotors. The native
 * `disabled` property is also intentionally absent (the chip is wired
 * for click handling), so a stray `aria-disabled` would create an even
 * worse mismatch — visually clickable, programmatically clickable, but
 * announced as disabled. Pinning the literal markup absence here closes
 * the loop on the chip side: a regression that pre-emptively added
 * `aria-disabled` to the shared `Chip` helper (or special-cased the
 * Hidden chip) would break the AT contract, while every existing
 * sibling pin (role/glyph/badge/etc.) would still pass.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `aria-disabled` to ANY chip
 *    today, but no existing test reads `hasAttribute("aria-disabled")`
 *    on the `chip-hidden` button specifically. Sibling files such as
 *    LobbyChipHiddenRole.test.tsx,
 *    LobbyChipHiddenAriaPressedDefault.test.tsx,
 *    LobbyChipHiddenType.test.tsx,
 *    LobbyChipHiddenNoAriaControls.test.tsx,
 *    LobbyChipHiddenNoAriaLabel.test.tsx,
 *    LobbyChipHiddenNoId.test.tsx,
 *    LobbyChipHiddenNoStyle.test.tsx and
 *    LobbyChipHiddenGlyphAria.test.tsx all fetch the chip via
 *    `data-testid="chip-hidden"` but each pins a different attribute.
 *    Sibling per-chip `NoAriaDisabled` files exist for board, arcade,
 *    cards, dice, solitaire, favorites, recently-played — `hidden`
 *    is the missing surface in that family.
 *  - LobbyDrawerToggleNoDisabled.test.tsx pins the absence of the
 *    native `disabled` property on a sibling surface (the drawer
 *    toggle) but does not cover chip-hidden nor the ARIA-flavored
 *    `aria-disabled` attribute, so a branch that special-cased the
 *    Hidden chip with an `aria-disabled` would slip past every
 *    existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-hidden"` (the
 * testId wired at LobbyPage.tsx via `testId="chip-hidden"`) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `hasAttribute("aria-disabled")` to pin the literal
 * markup absence — confirming the attribute is not present at all,
 * rather than checking for a particular value (which would still pass
 * for an explicit `aria-disabled="false"` that reacts in AT differently
 * from the attribute being missing entirely).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-hidden test) mirrors the established
 * per-surface-attribute pattern (e.g. LobbyChipBoardNoAriaDisabled.test.tsx
 * at W2616) so this shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-hidden has no aria-disabled attribute (W2630)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-hidden without an aria-disabled attribute (chip is always interactive)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden") as HTMLButtonElement;

    // The chip is always interactive — toggling its filter is the whole
    // point of the chip-strip. `hasAttribute` reads the literal markup
    // so a regression that adds `aria-disabled` (with any value, even
    // "false") fails here with a clear diff.
    expect(chip.hasAttribute("aria-disabled")).toBe(false);
  });
});
