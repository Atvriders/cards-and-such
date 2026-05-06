import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2707 — the LobbyPage `chip-hidden` Chip <button> MUST NOT carry a
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
 *   1. Form participation. If the chip-hidden chip ever ended up
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
 *   2. Implicit public contract. A `value="hidden"` would become a
 *      stable selector for `document.querySelector('button[value="…"]')`
 *      lookups that external code (extensions, automation, a11y
 *      tooling) could come to depend on, making the value an
 *      undeclared part of the public DOM contract — identical in
 *      shape to the `id`/`name` surfaces that other W-pins already
 *      lock as absent on chip-hidden.
 *
 * Sibling pins on `chip-hidden` already in the suite cover OTHER
 * absent attributes but NOT `value`:
 *   - LobbyChipHiddenNoId pins `id`-absence.
 *   - LobbyChipHiddenNoName pins `name`-absence.
 *   - LobbyChipHiddenNoStyle pins inline-style absence.
 *   - LobbyChipHiddenNoAutofocus pins `autofocus` absence.
 *   - LobbyChipHiddenNoForm pins `form` absence.
 *   - LobbyChipHiddenNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipHiddenNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipHiddenNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipHiddenType pins the explicit `type="button"`.
 *   - LobbyChipHiddenRole pins `role="tab"`.
 *
 * None of those would catch a regression that added a `value`
 * attribute to the Chip helper (e.g. `value={testId}` accidentally
 * introduced alongside `data-testid={testId}`). The sibling
 * LobbyChipArcadeNoValue (W2697) pins value-absence on chip-arcade,
 * but per-category coverage is the established pattern in this suite
 * (each chip has its own NoValue/NoId/NoName/etc. file) so this file
 * closes the gap on chip-hidden specifically.
 *
 * Resolves the chip via its stable `data-testid="chip-hidden"` so the
 * assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-hidden button has no value attribute (W2707)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-hidden <button> does NOT carry a value attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden");

    // Sanity: confirm we pinned the actual chip-hidden <button>
    // wrapper and not a child span. The Chip helper emits a <button>
    // for keyboard accessibility; if a refactor moved the testid
    // down onto an inner span, asserting `value` absence on that
    // span would be vacuously true and miss the real regression on
    // the button.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `value` attribute on chip-hidden. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `value=""` would still be a (broken) public surface that
    // future code could query against, and would still be exposed
    // via HTMLButtonElement.value as the empty string. We want the
    // attribute to be entirely absent.
    expect(chip.hasAttribute("value")).toBe(false);
  });
});
