import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2628 — the `chip-top-rated` button (the "Top rated" filter chip in
 * the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx around the `id="top-rated"` chip definition near line
 * 1819) MUST NOT carry an `aria-disabled` attribute in its current
 * shape. The chip is always interactive: it is a `role="tab"` (pinned
 * by W2552 in LobbyChipTopRatedRole.test.tsx) inside a
 * `role="tablist"` chip-strip, and toggling it filters the lobby grid
 * to games rated >= 4 stars (driving the `topRatedCount` count badge
 * computed at LobbyPage.tsx near line 1665). There is no LobbyPage
 * state in which the top-rated chip becomes disabled — selection is
 * communicated via `aria-pressed` / `aria-selected`, NOT by
 * `aria-disabled`.
 *
 * Why the absence of `aria-disabled` matters here:
 *   1. `aria-disabled="true"` would tell assistive technologies the
 *      affordance is currently non-functional, contradicting the
 *      visible chip's clickable affordance and confusing screen-reader
 *      users who rely on accurate state announcements.
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
 *    today (the `<button>` props are `type`, `role`, `aria-selected`,
 *    `aria-pressed`, `className`, `onClick`, `data-testid` only). But
 *    no existing test reads `hasAttribute("aria-disabled")` on the
 *    `chip-top-rated` button specifically. Sibling files such as
 *    LobbyChipTopRatedRole.test.tsx,
 *    LobbyChipTopRatedType.test.tsx,
 *    LobbyChipTopRatedNoAriaControls.test.tsx,
 *    LobbyChipTopRatedNoAriaLabel.test.tsx,
 *    LobbyChipTopRatedNoId.test.tsx,
 *    LobbyChipTopRatedNoStyle.test.tsx and
 *    LobbyChipTopRatedGlyphAria.test.tsx each pin a different ARIA /
 *    DOM attribute on the chip-top-rated button — none read the
 *    `aria-disabled` slot.
 *  - LobbyChipArcadeNoAriaDisabled.test.tsx (W2617),
 *    LobbyChipBoardNoAriaDisabled.test.tsx (W2616) and
 *    LobbyChipCardsNoAriaDisabled.test.tsx (W2615) pin the same
 *    attribute absence on different category chips but do not cover
 *    chip-top-rated, so a branch that special-cases the top-rated chip
 *    with an `aria-disabled` (e.g., to grey it out when
 *    `topRatedCount === 0`) would slip past every existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-top-rated"`
 * (the testId wired at LobbyPage.tsx via `testId="chip-top-rated"`) so
 * the lookup is locale-independent and immune to translation-key
 * changes (the visible label flows from `t("lobby.chip.top_rated")`).
 * The assertion uses `hasAttribute("aria-disabled")` to pin the literal
 * markup absence — confirming the attribute is not present at all,
 * rather than checking for a particular value (which would pass for an
 * explicit `aria-disabled="false"` that reacts in AT differently from
 * the absent slot).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-top-rated test) mirrors the per-
 * surface-attribute pattern used by LobbyChipArcadeNoAriaDisabled
 * (W2617), LobbyChipBoardNoAriaDisabled (W2616) and
 * LobbyChipCardsNoAriaDisabled (W2615) so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-top-rated has no aria-disabled attribute (W2628)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-top-rated without an aria-disabled attribute (chip is always interactive)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated") as HTMLButtonElement;

    // The chip is always interactive — selection is signalled via
    // `aria-pressed` / `aria-selected`, not `aria-disabled`. Use
    // `hasAttribute` (literal markup) rather than the `ariaDisabled`
    // IDL property so a regression that adds `aria-disabled` (with any
    // value, even the falsy literal `"false"`) fails here.
    expect(chip.hasAttribute("aria-disabled")).toBe(false);
  });
});
