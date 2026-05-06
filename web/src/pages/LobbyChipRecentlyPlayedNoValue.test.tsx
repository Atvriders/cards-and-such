import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2703 — the LobbyPage `chip-recently-played` Chip <button> MUST NOT
 * carry a `value` attribute. The Chip helper (LobbyPage.tsx) renders
 * its <button> wrapper with only the following attributes:
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
 * Notably absent — and load-bearing in its absence — is any `value`
 * attribute on the chip <button>. The `value` attribute on a <button>
 * is the form-submission payload mechanism: when a button is part of
 * a form submission (via type="submit" or as a member of a form), its
 * `value` attribute becomes the submitted name=value pair sent with
 * the form. The chip is NOT a form control: it has type="button" and
 * is a purely client-side filter trigger that calls a React onClick
 * handler. Adding a `value="recently-played"` (or any other value)
 * attribute would silently:
 *   1. Surface an undocumented public-API string (the value attribute
 *      itself) that external automation, scrapers, or assistive tech
 *      could come to depend on as a stable contract.
 *   2. Make the chip appear as a meaningful form-submission participant
 *      to accessibility tree walkers and assistive tech that special-
 *      case form-associated controls with values, conflating a
 *      stateless filter chip with form fields.
 *   3. If the chip were ever (accidentally or via refactor) placed
 *      inside a <form> and its type changed to "submit", that `value`
 *      would suddenly become part of the form's submitted payload.
 *
 * Sibling pins on `chip-recently-played` already in the suite cover
 * OTHER attribute absences but NOT `value`:
 *   - LobbyChipRecentlyPlayedNoId pins `id`-absence.
 *   - LobbyChipRecentlyPlayedNoName pins `name`-absence.
 *   - LobbyChipRecentlyPlayedNoStyle pins inline-style absence.
 *   - LobbyChipRecentlyPlayedNoForm pins `form` absence.
 *   - LobbyChipRecentlyPlayedNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipRecentlyPlayedNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipRecentlyPlayedNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipRecentlyPlayedNoAutofocus pins `autofocus` absence.
 *
 * None of those would catch a regression that added
 * `value="recently-played"` (or any other value) to the
 * chip-recently-played <button>. This file closes that gap.
 *
 * Resolves the chip via its stable `data-testid="chip-recently-played"`
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-recently-played button has no value attribute (W2703)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-recently-played <button> does NOT carry a value attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played");

    // Sanity: confirm we pinned the actual chip-recently-played <button>
    // wrapper and not a child span. The `value` attribute is only
    // meaningful on form-associated elements (button, input, etc.);
    // if a future refactor moved the testid down onto an inner span
    // the rest of this assertion would be meaningless, so guard the
    // tagName explicitly.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `value` attribute on chip-recently-played.
    // Use `hasAttribute` rather than `getAttribute(...)` truthiness —
    // a `value=""` would still be a (broken) form-payload surface that
    // future code could come to depend on, and `getAttribute("value")`
    // returning "" would silently pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("value")).toBe(false);
  });
});
