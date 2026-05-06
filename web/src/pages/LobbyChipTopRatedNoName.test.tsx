import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2667 — the LobbyPage `chip-top-rated` Chip <button> MUST NOT carry a
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
 *   1. Form participation. If the chip-top-rated chip ever ended up
 *      rendered inside a <form> (whether by a future refactor that
 *      wraps the toolbar in a form, or by an ancestor that adopts
 *      <form> semantics for search/filter submission), a `name`
 *      attribute would cause the chip to contribute a name=value pair
 *      to form submission and to be exposed on `form.elements` by
 *      name. The lobby chips are presentational tab controls, not form
 *      submitters, and surfacing them as named form participants would
 *      pollute every enclosing form's submission payload.
 *   2. Implicit public contract. A `name="chip-top-rated"` would become
 *      a stable selector for `document.querySelector('button[name="…"]')`
 *      and `form.elements.namedItem("…")` lookups that external code
 *      (extensions, automation scripts, accessibility tools) could
 *      come to depend on, making the name an undeclared part of the
 *      public DOM contract identical in shape to the `id` surface
 *      that LobbyChipTopRatedNoId already pins as absent.
 *
 * Sibling pins on `chip-top-rated` already in the suite cover OTHER
 * absent attributes but NOT `name`:
 *   - LobbyChipTopRatedNoId pins `id`-absence.
 *   - LobbyChipTopRatedType pins the explicit `type="button"`.
 *   - LobbyChipTopRatedNoStyle pins inline-style absence.
 *   - LobbyChipTopRatedNoAutofocus pins `autofocus` absence.
 *   - LobbyChipTopRatedNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipTopRatedNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipTopRatedNoAriaDisabled pins `aria-disabled` absence.
 *
 * None of those would catch a regression that added a `name` attribute
 * to the Chip helper (e.g. `name={testId}` accidentally introduced
 * alongside `data-testid={testId}`). This file closes that gap on
 * chip-top-rated specifically, mirroring the per-category pinning
 * strategy already in place for `id`-absence and matching the
 * chip-arcade `name`-absence pin established by W2659.
 *
 * Resolves the chip via its stable `data-testid="chip-top-rated"` so
 * the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-top-rated button has no name attribute (W2667)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-top-rated <button> does NOT carry a name attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated");

    // Sanity: confirm we pinned the actual chip-top-rated <button>
    // wrapper and not a child span. The Chip helper emits a <button>
    // for keyboard accessibility; if a refactor moved the testid down
    // onto an inner span, asserting `name` absence on that span would
    // be vacuously true and miss the real regression on the button.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `name` attribute on chip-top-rated. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `name=""` would still be a (broken) public surface that future
    // code or form-submission flows could come to depend on, and
    // `getAttribute("name")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("name")).toBe(false);
  });
});
