import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2673 — the `chip-cards` button (the per-category cards chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) MUST NOT carry a `form` attribute in its current
 * shape. The chip is a `role="tab"` inside a `role="tablist"`
 * chip-strip used purely as an in-page filter — it is NOT a form
 * control, is not enclosed in a `<form>`, and never participates in
 * form submission.
 *
 * The HTML `form` content attribute on `<button>` elements explicitly
 * associates the button with a `<form>` element by id, even when the
 * button is rendered OUTSIDE that form. Two concrete failure modes
 * worth pinning against:
 *
 *  1. If a `form="<some-id>"` slipped onto the chip (for example via
 *     a copy-paste from a real submit button, or an over-eager prop
 *     spread), the chip would invisibly bind to whatever `<form>` of
 *     that id exists on the page and could be activated as a form
 *     submitter — silently submitting the lobby search form (or any
 *     future form sharing that id) on every chip click. That is a
 *     subtle, high-impact regression no other suite catches today.
 *  2. Even if no matching form id exists, the presence of the `form`
 *     attribute is a strong signal of intent that contradicts the
 *     chip's role as a filter tab. Pinning its absence keeps the
 *     `<button type="button" role="tab">` shape unambiguous.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `form` to ANY chip today.
 *    But no existing test reads `hasAttribute("form")` on the
 *    `chip-cards` button specifically. Sibling files such as
 *    LobbyChipCardsRole.test.tsx,
 *    LobbyChipCardsAriaSelectedDefault.test.tsx,
 *    LobbyChipCardsAriaPressedDefault.test.tsx,
 *    LobbyChipCardsType.test.tsx,
 *    LobbyChipCardsNoAriaControls.test.tsx,
 *    LobbyChipCardsNoAriaDisabled.test.tsx,
 *    LobbyChipCardsNoAriaLabel.test.tsx,
 *    LobbyChipCardsNoAutofocus.test.tsx,
 *    LobbyChipCardsNoId.test.tsx,
 *    LobbyChipCardsNoName.test.tsx,
 *    LobbyChipCardsNoStyle.test.tsx,
 *    LobbyChipCardsBadge.test.tsx and
 *    LobbyChipCardsGlyphAria.test.tsx all fetch the chip via
 *    `data-testid="chip-cards"` but each pins a different attribute —
 *    none read the `form` slot.
 *  - Sibling chip surfaces (chip-all, chip-arcade, chip-board, etc.)
 *    do not pin `form` absence on chip-cards either, so a branch that
 *    special-cases the cards chip with a `form` attribute would slip
 *    past every existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-cards"` (the
 * testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `hasAttribute("form")` to pin the literal markup
 * absence — confirming the attribute is not present at all, rather
 * than checking for a particular value (which would pass for an empty
 * `form=""`, itself a malformed-association bug).
 */
describe("LobbyPage — chip-cards has no form attribute (W2673)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-cards without a form attribute (it is a filter tab, not a form control)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards") as HTMLButtonElement;

    // The chip is a `role="tab"` filter, not a form control — it is
    // never enclosed in a `<form>` and never submits. A `form="<id>"`
    // attribute would associate the chip with an external form and
    // could cause silent submission on click. `hasAttribute` reads
    // the literal markup so a regression that adds the prop fails
    // here regardless of the value supplied (including empty-string).
    expect(chip.hasAttribute("form")).toBe(false);
  });
});
