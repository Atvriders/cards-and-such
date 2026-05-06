import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2687 — the LobbyPage `chip-hidden` Chip <button> MUST NOT carry a
 * `form` attribute. The Chip helper (LobbyPage.tsx) renders its
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
 * Notably absent — and load-bearing in its absence — is any `form`
 * attribute on the chip <button>. The `form` attribute on a <button>
 * is the HTML5 form-association mechanism: it lets a button that lives
 * OUTSIDE a <form> element associate itself with a form by id, so that
 * clicking it (with type="submit", "reset", or default) participates
 * in that form's submission/reset lifecycle. The chip is NOT a form
 * control: it has type="button" and is a purely client-side filter
 * trigger that calls a React onClick handler. Adding a `form="..."`
 * attribute would silently:
 *   1. Associate the chip with the named <form>, making the chip a
 *      member of `form.elements` and a candidate for `form.reset()`
 *      side-effects even though it has no submission semantics.
 *   2. Cause the button to be considered a form-owner-related element
 *      by accessibility tree walkers and assistive tech that special-
 *      case form-associated controls, conflating a stateless filter
 *      chip with form fields.
 *   3. Surface an undocumented public-API string (the value of the
 *      `form` attribute, i.e. some other element's id) that external
 *      automation, scrapers, or assistive tech could come to depend
 *      on, AND couple the chip to the lifetime/identity of an
 *      unrelated <form id="..."> elsewhere in the DOM.
 *
 * Sibling pins on `chip-hidden` already in the suite cover OTHER
 * attribute absences but NOT `form`:
 *   - LobbyChipHiddenNoId pins `id`-absence.
 *   - LobbyChipHiddenNoName pins `name`-absence.
 *   - LobbyChipHiddenNoStyle pins inline-style absence.
 *   - LobbyChipHiddenNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipHiddenNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipHiddenNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipHiddenNoAutofocus pins `autofocus` absence.
 *
 * None of those would catch a regression that added `form="search"`
 * (or any other value) to the chip-hidden <button>. This file closes
 * that gap.
 *
 * Resolves the chip via its stable `data-testid="chip-hidden"` so the
 * assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-hidden button has no form attribute (W2687)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-hidden <button> does NOT carry a form attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden");

    // Sanity: confirm we pinned the actual chip-hidden <button> wrapper
    // and not a child span. The `form` attribute is only meaningful on
    // form-associated elements (button, input, select, textarea, etc.);
    // if a future refactor moved the testid down onto an inner span
    // the rest of this assertion would be meaningless, so guard the
    // tagName explicitly.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `form` attribute on chip-hidden. Use
    // `hasAttribute` rather than `getAttribute(...)` truthiness — a
    // `form=""` would still be a (broken) form-association surface
    // that future code could come to depend on, and
    // `getAttribute("form")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("form")).toBe(false);
  });
});
