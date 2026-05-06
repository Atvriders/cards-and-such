import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2671 — the LobbyPage `chip-all` Chip <button> MUST NOT carry a
 * `name` attribute. The Chip helper (LobbyPage.tsx) emits a button
 * wrapper that intentionally omits `name` for the same reasons that
 * `id`, inline `style`, `autofocus`, `aria-label`, `aria-controls`,
 * and `aria-disabled` are absent on this surface:
 *
 *   1. Form participation. If the chip-all chip ever ended up
 *      rendered inside a <form> (whether by a future refactor that
 *      wraps the toolbar in a form, or by an ancestor that adopts
 *      <form> semantics for search/filter submission), a `name`
 *      attribute would cause the chip to contribute a name=value pair
 *      to form submission and to be exposed on `form.elements` by
 *      name. The lobby chips are presentational tab controls, not form
 *      submitters, and surfacing them as named form participants would
 *      pollute every enclosing form's submission payload.
 *   2. Implicit public contract. A `name="chip-all"` would become a
 *      stable selector for `document.querySelector('button[name="…"]')`
 *      and `form.elements.namedItem("…")` lookups that external code
 *      (extensions, automation scripts, accessibility tools) could
 *      come to depend on, making the name an undeclared part of the
 *      public DOM contract identical in shape to the `id` surface
 *      that the LobbyChipAllNoId pin already covers.
 *
 * Sibling pins on `chip-all` already in the suite cover OTHER absent
 * attributes but NOT `name`:
 *   - LobbyChipAllNoId         pins `id`-absence.
 *   - LobbyChipAllNoStyle      pins inline-style absence.
 *   - LobbyChipAllNoAutofocus  pins `autofocus` absence.
 *   - LobbyChipAllNoAriaLabel  pins `aria-label` absence.
 *   - LobbyChipAllNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipAllRole         pins `role="tab"` presence.
 *
 * None of those would catch a regression that added a `name` attribute
 * to the Chip helper (e.g. `name={testId}` accidentally introduced
 * alongside `data-testid={testId}`). This file closes that gap on
 * chip-all specifically, mirroring the per-category pinning strategy
 * already used by W2659 / LobbyChipArcadeNoName for chip-arcade.
 *
 * Resolves the chip via its stable `data-testid="chip-all"` so the
 * assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-all button has no name attribute (W2671)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-all <button> does NOT carry a name attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all");

    // Sanity: confirm we pinned the actual chip-all <button> wrapper
    // and not a child span. The Chip helper emits a <button> for
    // keyboard accessibility; if a refactor moved the testid down onto
    // an inner span, asserting `name` absence on that span would be
    // vacuously true and miss the real regression on the button.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `name` attribute on chip-all. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `name=""` would still be a (broken) public surface that future
    // code or form-submission flows could come to depend on, and
    // `getAttribute("name")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("name")).toBe(false);
  });
});
