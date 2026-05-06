import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2665 — the LobbyPage `chip-recently-played` Chip <button> MUST NOT
 * carry a `name` attribute. The Chip helper (LobbyPage.tsx ~L2651-2666)
 * emits exactly the following props on its <button> wrapper:
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
 *   1. Form participation. If the chip-recently-played chip ever ended
 *      up rendered inside a <form> (whether by a future refactor that
 *      wraps the toolbar in a form, or by an ancestor that adopts
 *      <form> semantics for search/filter submission), a `name`
 *      attribute would cause the chip to contribute a name=value pair
 *      to form submission and to be exposed on `form.elements` by
 *      name. The lobby chips are presentational tab controls, not form
 *      submitters, and surfacing them as named form participants would
 *      pollute every enclosing form's submission payload.
 *   2. Implicit public contract. A `name="chip-recently-played"` would
 *      become a stable selector for `document.querySelector('button[name="…"]')`
 *      and `form.elements.namedItem("…")` lookups that external code
 *      (extensions, automation scripts, accessibility tools) could
 *      come to depend on, making the name an undeclared part of the
 *      public DOM contract identical in shape to the `id` surface
 *      that W2485 already pins as absent.
 *
 * Sibling pins on `chip-recently-played` already in the suite cover
 * OTHER absent attributes but NOT `name`:
 *   - W2485 / LobbyChipRecentlyPlayedNoId pins `id`-absence.
 *   - W2464 / LobbyChipRecentlyPlayedType pins `type="button"`.
 *   - LobbyChipRecentlyPlayedNoStyle pins inline-style absence.
 *   - LobbyChipRecentlyPlayedNoAutofocus pins `autofocus` absence.
 *   - LobbyChipRecentlyPlayedNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipRecentlyPlayedNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipRecentlyPlayedNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipRecentlyPlayedRole pins `role="tab"`.
 *   - W1462 / LobbyChipRecentGlyphAria pins glyph aria-hidden + `↺`.
 *   - W1175 / LobbyRecentlyPlayedChipBadgeZero pins the badge count.
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"`.
 *
 * None of those would catch a regression that added a `name` attribute
 * to the Chip helper (e.g. `name={testId}` accidentally introduced
 * alongside `data-testid={testId}`). This file closes that gap on
 * chip-recently-played specifically, mirroring the per-category
 * pinning strategy used for `name`-absence on chip-arcade (W2659),
 * chip-board, chip-cards, chip-dice, chip-favorites, and chip-hidden.
 *
 * Resolves the chip via its stable `data-testid="chip-recently-played"`
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-recently-played button has no name attribute (W2665)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-recently-played <button> does NOT carry a name attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played");

    // Sanity: confirm we pinned the actual chip-recently-played <button>
    // wrapper and not a child span. The Chip helper emits a <button> for
    // keyboard accessibility; if a refactor moved the testid down onto
    // an inner span, asserting `name` absence on that span would be
    // vacuously true and miss the real regression on the button.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `name` attribute on chip-recently-played.
    // Use `hasAttribute` rather than checking for an empty string — a
    // `name=""` would still be a (broken) public surface that future
    // code or form-submission flows could come to depend on, and
    // `getAttribute("name")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("name")).toBe(false);
  });
});
