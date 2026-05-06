import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2617 — the `chip-arcade` button (the per-category arcade chip in
 * the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) MUST NOT carry an `aria-disabled` attribute in its
 * current shape. The chip is always interactive: it is a `role="tab"`
 * (pinned by W2555 in LobbyChipArcadeRole.test.tsx) inside a
 * `role="tablist"` chip-strip, and toggling it filters the lobby grid
 * by the arcade category. There is no LobbyPage state in which the
 * arcade chip becomes disabled — selection is communicated via
 * `aria-pressed` / `aria-selected` (already pinned by
 * LobbyChipArcadeAriaPressedDefault.test.tsx and
 * LobbyChipArcadeAriaSelectedDefault.test.tsx), NOT by `aria-disabled`.
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
 *    today (the `<button>` props are `type`, `role`, `aria-selected`,
 *    `aria-pressed`, `className`, `onClick`, `data-testid` only). But
 *    no existing test reads `hasAttribute("aria-disabled")` on the
 *    `chip-arcade` button specifically. Sibling files such as
 *    LobbyChipArcadeRole.test.tsx (W2555),
 *    LobbyChipArcadeAriaSelectedDefault.test.tsx,
 *    LobbyChipArcadeAriaPressedDefault.test.tsx,
 *    LobbyChipArcadeType.test.tsx,
 *    LobbyChipArcadeNoAriaControls.test.tsx,
 *    LobbyChipArcadeNoAriaLabel.test.tsx (W2599),
 *    LobbyChipArcadeNoId.test.tsx and LobbyChipArcadeNoStyle.test.tsx
 *    each pin a different ARIA / DOM attribute on the chip-arcade
 *    button — none read the `aria-disabled` slot.
 *  - LobbyChipBoardNoAriaDisabled.test.tsx (W2616) and
 *    LobbyChipCardsNoAriaDisabled.test.tsx (W2615) pin the same
 *    attribute absence on different category chips but do not cover
 *    chip-arcade, so a branch that special-cases the arcade chip with
 *    an `aria-disabled` would slip past every existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-arcade"` (the
 * testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `hasAttribute("aria-disabled")` to pin the literal
 * markup absence — confirming the attribute is not present at all,
 * rather than checking for a particular value (which would pass for an
 * explicit `aria-disabled="false"` that reacts in AT differently from
 * the absent slot).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-arcade test) mirrors the per-surface-
 * attribute pattern used by LobbyChipBoardNoAriaDisabled.test.tsx
 * (W2616) and LobbyChipCardsNoAriaDisabled.test.tsx (W2615) so this
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-arcade has no aria-disabled attribute (W2617)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-arcade without an aria-disabled attribute (chip is always interactive)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-arcade") as HTMLButtonElement;

    // The chip is always interactive — selection is signalled via
    // `aria-pressed` / `aria-selected`, not `aria-disabled`. Use
    // `hasAttribute` (literal markup) rather than the `ariaDisabled`
    // IDL property so a regression that adds `aria-disabled` (with any
    // value, even the falsy literal `"false"`) fails here.
    expect(chip.hasAttribute("aria-disabled")).toBe(false);
  });
});
