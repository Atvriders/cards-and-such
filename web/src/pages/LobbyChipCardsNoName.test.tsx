import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2655 — the `chip-cards` button (the per-category cards chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) MUST NOT carry a `name` attribute in its current
 * shape. The chip is a `role="tab"` inside a `role="tablist"`
 * chip-strip used purely as an in-page filter — it is NOT a form
 * control, is not enclosed in a `<form>`, and never participates in
 * form submission. Layering a `name` attribute on a non-form `<button>`
 * has two concrete failure modes worth pinning against:
 *
 *  1. If the chip is ever moved into (or accidentally enclosed by) a
 *     `<form>`, a `name` attribute would cause the button's value to
 *     be serialised on submit — producing a spurious form field that
 *     no server route expects. That is a silent data-shape regression
 *     no other suite catches today.
 *  2. The HTML `name` attribute on `<button>` elements does NOT
 *     contribute to the accessible name (per ARIA name computation),
 *     so adding one would create the misleading impression that the
 *     chip's a11y label is wired through `name=` when in fact the
 *     accessible name is supplied by the visible text children. That
 *     ambiguity is a maintenance trap.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `name` to ANY chip today.
 *    But no existing test reads `hasAttribute("name")` on the
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
 *    LobbyChipCardsNoStyle.test.tsx,
 *    LobbyChipCardsBadge.test.tsx and
 *    LobbyChipCardsGlyphAria.test.tsx all fetch the chip via
 *    `data-testid="chip-cards"` but each pins a different attribute —
 *    none read the `name` slot.
 *  - Sibling chip surfaces (chip-all, chip-arcade, chip-board, etc.)
 *    do not pin `name` absence on chip-cards either, so a branch that
 *    special-cases the cards chip with a `name` attribute (e.g. to
 *    wire it into a future filter `<form>`) would slip past every
 *    existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-cards"` (the
 * testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `hasAttribute("name")` to pin the literal markup
 * absence — confirming the attribute is not present at all, rather
 * than checking for a particular value (which would pass for an empty
 * `name=""`, itself a form-serialisation bug).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-cards test) mirrors the W2595
 * (chip-cards no-aria-label) per-surface-attribute pattern so this
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-cards has no name attribute (W2655)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-cards without a name attribute (it is a filter tab, not a form control)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards") as HTMLButtonElement;

    // The chip is a `role="tab"` filter, not a form control — it is
    // never enclosed in a `<form>` and never submitted. A `name`
    // attribute would either be dead markup or, if the chip is later
    // moved into a form, cause spurious form-field serialisation.
    // `hasAttribute` reads the literal markup so a regression that
    // adds the prop fails here with a clear diff regardless of the
    // value supplied (including empty-string).
    expect(chip.hasAttribute("name")).toBe(false);
  });
});
