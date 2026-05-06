import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2625 — the `chip-recently-played` button (the "Recently Played" chip
 * in the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx with `testId="chip-recently-played"`) MUST NOT carry an
 * `aria-disabled` attribute in its current shape. The chip is always
 * interactive: it is a `role="tab"` (pinned in
 * LobbyChipRecentlyPlayedRole.test.tsx) inside a `role="tablist"`
 * chip-strip, and toggling it filters the lobby grid to the user's
 * recently-played tiles. There is no LobbyPage state in which this chip
 * becomes disabled — even an empty recently-played set leaves the chip
 * clickable (it just renders an empty grid). Selection is communicated
 * via `aria-pressed` / `aria-selected`, NOT by `aria-disabled`.
 *
 * Why the absence of `aria-disabled` matters here:
 *   1. `aria-disabled="true"` would tell assistive technologies the
 *      affordance is currently non-functional, contradicting the visible
 *      chip's clickable affordance and confusing screen-reader users.
 *   2. Even an explicit `aria-disabled="false"` is a regression — most
 *      AT engines treat the literal attribute presence as semantically
 *      meaningful and may announce "not disabled" verbosely or apply
 *      different focus semantics. The contract is attribute *absence*.
 *   3. CSS that targets `[aria-disabled]` (a common design-system
 *      pattern for greyed-out states) would visually lie if the chip
 *      ever sprouted the attribute, regardless of value.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `aria-disabled` to ANY chip
 *    today, but no existing test reads `hasAttribute("aria-disabled")`
 *    on the `chip-recently-played` button specifically. Sibling files
 *    such as LobbyChipRecentlyPlayedRole.test.tsx,
 *    LobbyChipRecentlyPlayedType.test.tsx,
 *    LobbyChipRecentlyPlayedNoAriaControls.test.tsx,
 *    LobbyChipRecentlyPlayedNoAriaLabel.test.tsx,
 *    LobbyChipRecentlyPlayedNoId.test.tsx and
 *    LobbyChipRecentlyPlayedNoStyle.test.tsx each pin a different ARIA
 *    / DOM attribute on the chip-recently-played button — none read the
 *    `aria-disabled` slot.
 *  - LobbyChipArcadeNoAriaDisabled.test.tsx (W2617),
 *    LobbyChipBoardNoAriaDisabled.test.tsx (W2616),
 *    LobbyChipCardsNoAriaDisabled.test.tsx (W2615) and
 *    LobbyChipFavoritesNoAriaDisabled.test.tsx (W2619) pin the same
 *    attribute absence on different chips but do not cover
 *    chip-recently-played, so a branch that special-cases the
 *    recently-played chip with an `aria-disabled` (e.g. when the
 *    recently-played set is empty) would slip past every existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-recently-played"`
 * (the testId wired at LobbyPage.tsx via `testId="chip-recently-played"`)
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `hasAttribute("aria-disabled")` to pin
 * the literal markup absence — confirming the attribute is not present
 * at all, rather than checking for a particular value (which would pass
 * for an explicit `aria-disabled="false"` that reacts in AT differently
 * from the absent slot).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-recently-played test) mirrors the
 * per-surface-attribute pattern used by
 * LobbyChipArcadeNoAriaDisabled.test.tsx (W2617),
 * LobbyChipBoardNoAriaDisabled.test.tsx (W2616),
 * LobbyChipCardsNoAriaDisabled.test.tsx (W2615) and
 * LobbyChipFavoritesNoAriaDisabled.test.tsx (W2619) so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to either mega-file.
 */
describe("LobbyPage — chip-recently-played has no aria-disabled attribute (W2625)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-recently-played without an aria-disabled attribute (chip is always interactive)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played") as HTMLButtonElement;

    // The chip is always interactive — selection is signalled via
    // `aria-pressed` / `aria-selected`, not `aria-disabled`. Use
    // `hasAttribute` (literal markup) rather than the `ariaDisabled`
    // IDL property so a regression that adds `aria-disabled` (with any
    // value, even the falsy literal `"false"`) fails here.
    expect(chip.hasAttribute("aria-disabled")).toBe(false);
  });
});
