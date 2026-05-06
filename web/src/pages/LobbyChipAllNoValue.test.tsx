import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2709 — the LobbyPage `chip-all` Chip <button> MUST NOT carry a
 * `value` attribute. The Chip helper (LobbyPage.tsx) emits exactly
 * the following props on its <button> wrapper:
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
 * on the per-category chip itself. The `value` attribute on a
 * <button> is meaningful in two ways that would silently break this
 * surface if introduced:
 *
 *   1. Form participation. If the chip-all chip ever ended up
 *      rendered inside a <form> (whether via a future refactor that
 *      wraps the toolbar in a form, or by an ancestor that adopts
 *      <form> semantics for search/filter submission), a `value`
 *      attribute on a <button type="submit"> would be sent in the
 *      form payload, and a `value` on a <button type="button"> would
 *      still be exposed via `HTMLButtonElement.value` to scripts. The
 *      lobby chips are presentational tab controls, NOT form data
 *      carriers, and giving them a `value` would silently leak a
 *      payload field if any future refactor flips the type or wraps
 *      the toolbar in a form.
 *   2. Implicit public contract. A `value="all"` would become a
 *      stable selector for `document.querySelector('button[value="…"]')`
 *      lookups that external code (extensions, automation, a11y
 *      tooling) could come to depend on, making the value an
 *      undeclared part of the public DOM contract — identical in
 *      shape to the `id`/`name` surfaces that LobbyChipAllNoId /
 *      LobbyChipAllNoName already pin as absent.
 *
 * The chip-all chip is the default-active "All" filter and is
 * special-cased relative to its siblings: it is the only chip whose
 * `count` reflects `GAMES.length` (the unfiltered total) rather than
 * a per-family subset. That makes it the most likely candidate for an
 * accidental future refactor that introduces a `value` attribute
 * (e.g. `value={String(count)}` to expose the total via the DOM, or
 * `value="all"` mirroring the filter key alongside `data-testid`).
 * This pin guards explicitly against either of those slips.
 *
 * Sibling pins on `chip-all` already in the suite cover OTHER
 * absent attributes but NOT `value`:
 *   - LobbyChipAllNoId pins `id`-absence.
 *   - LobbyChipAllNoName pins `name`-absence.
 *   - LobbyChipAllNoForm pins `form` absence.
 *   - LobbyChipAllNoStyle pins inline-style absence.
 *   - LobbyChipAllNoAutofocus pins `autofocus` absence.
 *   - LobbyChipAllNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipAllNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipAllRole pins the explicit `role="tab"`.
 *
 * None of those would catch a regression that added a `value`
 * attribute to the Chip helper as it is rendered for the "all"
 * filter. This file closes that gap on chip-all specifically,
 * mirroring the per-category pinning strategy used for the sibling
 * chips (chip-arcade/chip-board/chip-cards/chip-dice/chip-solitaire/
 * chip-favorites/chip-recently-played/chip-top-rated), which each
 * have their own *NoValue pin already.
 *
 * Resolves the chip via its stable `data-testid="chip-all"` so the
 * assertion is locale-independent and immune to translation-key
 * changes (e.g. `lobby.chip.all` text changing from "All" to "All
 * games" in a future i18n revision).
 */
describe("LobbyPage — chip-all button has no value attribute (W2709)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-all <button> does NOT carry a value attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all");

    // Sanity: confirm we pinned the actual chip-all <button> wrapper
    // and not a child span. The Chip helper emits a <button> for
    // keyboard accessibility; if a refactor moved the testid down
    // onto an inner span, asserting `value` absence on that span
    // would be vacuously true and miss the real regression on the
    // button.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `value` attribute on chip-all. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `value=""` would still be a (broken) public surface that
    // future code could query against, and would still be exposed
    // via HTMLButtonElement.value as the empty string. We want the
    // attribute to be entirely absent.
    expect(chip.hasAttribute("value")).toBe(false);
  });
});
