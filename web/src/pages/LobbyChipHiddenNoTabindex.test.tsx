import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2722 — the LobbyPage `chip-hidden` Chip <button> MUST NOT carry a
 * `tabindex` attribute. The Chip helper (LobbyPage.tsx) renders its
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
 * Notably absent — and load-bearing in its absence — is any `tabindex`
 * attribute on the chip <button>. A native <button> element is already
 * in the sequential focus navigation order by default (its default
 * tabindex is 0 in the focus model), so adding an explicit `tabindex`
 * is redundant in the best case and harmful in the worst:
 *
 *   1. `tabindex="-1"` would REMOVE the chip from sequential keyboard
 *      navigation, silently breaking keyboard accessibility for the
 *      "Hidden" filter — keyboard-only users could no longer Tab to
 *      the chip to toggle the hidden-games filter.
 *   2. `tabindex="0"` is redundant for a native button and tends to be
 *      cargo-culted onto elements; pinning its absence prevents
 *      accidental "harmless-looking" additions that obscure the
 *      contract that this is a plain native button relying on default
 *      focus behavior.
 *   3. Any positive `tabindex` (e.g. `tabindex="1"`) would hoist this
 *      chip to the front of the document tab order, scrambling the
 *      keyboard navigation sequence of the entire LobbyPage and
 *      violating WCAG 2.4.3 (Focus Order).
 *   4. The presence of `tabindex` (regardless of value) is itself a
 *      public-API surface that external automation, CSS selectors
 *      (`[tabindex]`), and assistive-tech heuristics could come to
 *      depend on, coupling outside callers to an implementation
 *      detail that today does not exist.
 *
 * Sibling pins on `chip-hidden` already in the suite cover OTHER
 * attribute absences but NOT `tabindex`:
 *   - LobbyChipHiddenNoId pins `id`-absence.
 *   - LobbyChipHiddenNoName pins `name`-absence.
 *   - LobbyChipHiddenNoForm pins `form`-absence.
 *   - LobbyChipHiddenNoStyle pins inline-style absence.
 *   - LobbyChipHiddenNoValue pins `value`-absence.
 *   - LobbyChipHiddenNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipHiddenNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipHiddenNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipHiddenNoAutofocus pins `autofocus` absence.
 *
 * None of those would catch a regression that added `tabindex="-1"`
 * (or any other value) to the chip-hidden <button>. This file closes
 * that gap.
 *
 * Resolves the chip via its stable `data-testid="chip-hidden"` so the
 * assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-hidden button has no tabindex attribute (W2722)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-hidden <button> does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden");

    // Sanity: confirm we pinned the actual chip-hidden <button> wrapper
    // and not a child span. `tabindex` is meaningful on any element,
    // but the contract being pinned here is specifically about the
    // native <button> relying on its default focus behavior; if a
    // future refactor moved the testid down onto an inner span the
    // rest of this assertion would be meaningless, so guard the
    // tagName explicitly.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `tabindex` attribute on chip-hidden. Use
    // `hasAttribute` rather than `getAttribute(...)` truthiness — a
    // `tabindex="0"` would still be a (redundant) public surface that
    // future code could come to depend on, and `getAttribute("tabindex")`
    // returning "0" would NOT be caught by a `.toBeFalsy()`-style check
    // either, but more importantly the pin we want is "attribute is
    // absent", not "attribute is empty/zero".
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
