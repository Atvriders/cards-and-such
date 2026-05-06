import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2659 — the LobbyPage `chip-arcade` Chip <button> MUST NOT carry a
 * `name` attribute. The Chip helper (LobbyPage.tsx ~L2651-2666) emits
 * exactly the following props on its <button> wrapper:
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
 *   1. Form participation. If the chip-arcade chip ever ended up
 *      rendered inside a <form> (whether by a future refactor that
 *      wraps the toolbar in a form, or by an ancestor that adopts
 *      <form> semantics for search/filter submission), a `name`
 *      attribute would cause the chip to contribute a name=value pair
 *      to form submission and to be exposed on `form.elements` by
 *      name. The lobby chips are presentational tab controls, not form
 *      submitters, and surfacing them as named form participants would
 *      pollute every enclosing form's submission payload.
 *   2. Implicit public contract. A `name="chip-arcade"` would become a
 *      stable selector for `document.querySelector('button[name="…"]')`
 *      and `form.elements.namedItem("…")` lookups that external code
 *      (extensions, automation scripts, accessibility tools) could
 *      come to depend on, making the name an undeclared part of the
 *      public DOM contract identical in shape to the `id` surface
 *      that W2482 already pins as absent.
 *
 * Sibling pins on `chip-arcade` already in the suite cover OTHER
 * absent attributes but NOT `name`:
 *   - W2482 / LobbyChipArcadeNoId pins `id`-absence.
 *   - W2467 / LobbyChipArcadeType pins the explicit `type="button"`.
 *   - W*** / LobbyChipArcadeNoStyle pins inline-style absence.
 *   - W*** / LobbyChipArcadeNoAutofocus pins `autofocus` absence.
 *   - W*** / LobbyChipArcadeNoAriaLabel pins `aria-label` absence.
 *   - W*** / LobbyChipArcadeNoAriaControls pins `aria-controls` absence.
 *   - W*** / LobbyChipArcadeNoAriaDisabled pins `aria-disabled` absence.
 *
 * None of those would catch a regression that added a `name` attribute
 * to the Chip helper (e.g. `name={testId}` accidentally introduced
 * alongside `data-testid={testId}`). This file closes that gap on
 * chip-arcade specifically, mirroring the per-category pinning
 * strategy used for `id`-absence in W2482.
 *
 * Resolves the chip via its stable `data-testid="chip-arcade"` so the
 * assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-arcade button has no name attribute (W2659)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-arcade <button> does NOT carry a name attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-arcade");

    // Sanity: confirm we pinned the actual chip-arcade <button> wrapper
    // and not a child span. The Chip helper emits a <button> for
    // keyboard accessibility; if a refactor moved the testid down onto
    // an inner span, asserting `name` absence on that span would be
    // vacuously true and miss the real regression on the button.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `name` attribute on chip-arcade. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `name=""` would still be a (broken) public surface that future
    // code or form-submission flows could come to depend on, and
    // `getAttribute("name")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("name")).toBe(false);
  });
});
