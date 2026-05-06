import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2657 — the LobbyPage `chip-board` Chip <button> MUST NOT carry a
 * `name` attribute. The Chip helper (LobbyPage.tsx) renders its
 * <button> wrapper with only the following attributes:
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
 * the chip <button>. The chip is NOT a form control: it lives outside
 * any <form>, it is a purely client-side filter trigger that calls a
 * React onClick handler, and it has no associated submission. Adding a
 * `name` would silently:
 *   1. Cause the chip to be serialized into any future ancestor <form>
 *      (e.g. if the toolbar is later wrapped in a search form), turning
 *      a stateless filter chip into a phantom form field that pollutes
 *      submitted form data.
 *   2. Make the chip a `RadioNodeList` candidate for `form.elements`
 *      lookups, coupling unrelated form code to the chip's existence.
 *   3. Surface an undocumented public-API string (the value of the
 *      `name` attribute) that external automation, scrapers, or
 *      assistive tech could come to depend on.
 *
 * Sibling pins on `chip-board` already in the suite cover OTHER
 * attribute absences but NOT `name`:
 *   - W2495 / LobbyChipBoardNoId pins `id`-absence.
 *   - W?? / LobbyChipBoardNoStyle pins inline-style absence.
 *   - W?? / LobbyChipBoardNoAriaLabel pins `aria-label` absence.
 *   - W?? / LobbyChipBoardNoAriaControls pins `aria-controls` absence.
 *   - W?? / LobbyChipBoardNoAriaDisabled pins `aria-disabled` absence.
 *   - W?? / LobbyChipBoardNoAutofocus pins `autofocus` absence.
 *
 * None of those would catch a regression that added `name="board"` (or
 * any other value) to the chip-board <button>. This file closes that
 * gap.
 *
 * Resolves the chip via its stable `data-testid="chip-board"` so the
 * assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-board button has no name attribute (W2657)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-board <button> does NOT carry a name attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-board");

    // Sanity: confirm we pinned the actual chip-board <button> wrapper
    // and not a child span. The Chip helper emits a <button> for
    // keyboard accessibility; if a future refactor moved the testid
    // down onto an inner span the rest of this assertion would be
    // meaningless (spans cannot meaningfully carry `name` for form
    // submission), so guard the tagName explicitly.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `name` attribute on chip-board. Use
    // `hasAttribute` rather than `getAttribute(...)` truthiness — a
    // `name=""` would still be a (broken) form-submission surface that
    // future code could come to depend on, and `getAttribute("name")`
    // returning "" would silently pass a `.toBeFalsy()` style
    // assertion.
    expect(chip.hasAttribute("name")).toBe(false);
  });
});
