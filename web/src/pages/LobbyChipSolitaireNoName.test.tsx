import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2663 — the LobbyPage `chip-solitaire` Chip <button> MUST NOT carry a
 * `name` attribute. The Chip helper in LobbyPage.tsx emits exactly the
 * following props on its <button> wrapper:
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
 * Notably absent — and load-bearing in its absence — is any `name` on
 * the per-category chip itself. The `name` attribute on a <button> is
 * meaningful in two ways that would silently break this surface if
 * introduced:
 *
 *   1. Form participation. If the chip-solitaire chip ever ended up
 *      rendered inside a <form> (whether by a future refactor that
 *      wraps the toolbar in a form, or by an ancestor that adopts
 *      <form> semantics for search/filter submission), a `name`
 *      attribute would cause the chip to contribute a name=value pair
 *      to form submission and to be exposed on `form.elements` by
 *      name. The lobby chips are presentational tab controls, not form
 *      submitters, and surfacing them as named form participants would
 *      pollute every enclosing form's submission payload.
 *   2. Implicit public contract. A `name="chip-solitaire"` would become
 *      a stable selector for `document.querySelector('button[name="…"]')`
 *      and `form.elements.namedItem("…")` lookups that external code
 *      (extensions, automation scripts, accessibility tools) could
 *      come to depend on, making the name an undeclared part of the
 *      public DOM contract identical in shape to the `id` surface
 *      that LobbyChipSolitaireNoId already pins as absent.
 *
 * Sibling pins on `chip-solitaire` already in the suite cover OTHER
 * absent attributes but NOT `name`:
 *   - LobbyChipSolitaireNoId pins `id`-absence.
 *   - LobbyChipSolitaireType pins the explicit `type="button"`.
 *   - LobbyChipSolitaireNoStyle pins inline-style absence.
 *   - LobbyChipSolitaireNoAutofocus pins `autofocus` absence.
 *   - LobbyChipSolitaireNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipSolitaireNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipSolitaireNoAriaDisabled pins `aria-disabled` absence.
 *
 * None of those would catch a regression that added a `name` attribute
 * to the Chip helper (e.g. `name={testId}` accidentally introduced
 * alongside `data-testid={testId}`). This file closes that gap on
 * chip-solitaire specifically, mirroring the per-category pinning
 * strategy used for `id`-absence and the W2659 `name`-absence pin on
 * chip-arcade.
 *
 * Resolves the chip via its stable `data-testid="chip-solitaire"` so
 * the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-solitaire button has no name attribute (W2663)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-solitaire <button> does NOT carry a name attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire");

    // Sanity: confirm we pinned the actual chip-solitaire <button>
    // wrapper and not a child span. The Chip helper emits a <button>
    // for keyboard accessibility; if a refactor moved the testid down
    // onto an inner span, asserting `name` absence on that span would
    // be vacuously true and miss the real regression on the button.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `name` attribute on chip-solitaire. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `name=""` would still be a (broken) public surface that future
    // code or form-submission flows could come to depend on, and
    // `getAttribute("name")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("name")).toBe(false);
  });
});
