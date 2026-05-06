import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2711 — the LobbyPage `chip-cards` Chip <button> MUST NOT carry a
 * `tabindex` attribute. The Chip helper (LobbyPage.tsx) renders the
 * per-category chips inside the strip-level `CATEGORY_ORDER.map`; none
 * of those chips opt-in to a custom tab index, and the `cards` branch
 * is no exception.
 *
 * Sibling pins on `chip-cards` already in the suite cover OTHER
 * attributes but NOT the `tabindex`-attribute absence:
 *   - LobbyChipCardsNoStyle pins `style`-attribute absence.
 *   - LobbyChipCardsNoId pins the `id`-attribute absence.
 *   - LobbyChipCardsNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipCardsNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipCardsNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipCardsNoAutofocus (W2621) pins `autofocus` absence.
 *   - LobbyChipCardsNoForm pins `form` attribute absence.
 *   - LobbyChipCardsNoName pins `name` attribute absence.
 *   - LobbyChipCardsNoValue pins `value` attribute absence.
 *   - LobbyChipCardsAriaPressedDefault and
 *     LobbyChipCardsAriaSelectedDefault pin the toggle-state ARIA
 *     defaults but say nothing about `tabindex`.
 *   - LobbyChipCardsType pins the explicit `type="button"`.
 *
 * Why the absence of `tabindex` matters here:
 *   1. A bare <button> is natively focusable in tab order. Adding
 *      `tabindex="0"` would be redundant; adding `tabindex="-1"` would
 *      pull the chip OUT of the tab order, silently breaking
 *      keyboard-only category filtering for the `cards` branch.
 *   2. A positive `tabindex` value (e.g. `tabindex="1"`) on a single
 *      chip would warp the document tab sequence so that the chips
 *      strip jumps ahead of (or behind) the page heading and search
 *      field, an accessibility anti-pattern called out by WCAG 2.4.3
 *      (Focus Order).
 *   3. Roving-tabindex regions ELSEWHERE in this file (the left
 *      drawer's category rows and the lobby-grid tiles) DO set
 *      `tabIndex` deliberately — see the `tabIndex={drawerFocusIdx
 *      === drawerOrder.indexOf(cat) ? 0 : -1}` pattern. Pinning the
 *      absence on the strip-level `chip-cards` button guards against
 *      a future refactor that copy-pastes the roving-tabindex pattern
 *      onto the chip strip and accidentally subjects `chip-cards` to
 *      the same focus-juggling rules.
 *   4. Per-category regressions that added `tabindex` ONLY to the
 *      `cards` branch (e.g. via a conditional spread inside
 *      `CATEGORY_ORDER.map` when `cat === "cards"`) would slip past
 *      every other chip-cards pin unless the absence is asserted
 *      directly.
 *
 * Resolves the chip via its stable `data-testid="chip-cards"`
 * (rendered through `testId={`chip-${cat}`}`) so the assertion is
 * locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-cards button has no tabindex attribute (W2711)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-cards <button> does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards");

    // Sanity: confirm we pinned the actual chip-cards <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (spans without explicit tabindex are
    // unfocusable, so the assertion would be trivially true).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `tabindex` attribute on chip-cards.
    // Use `hasAttribute` rather than inspecting the IDL `.tabIndex`
    // property — `hasAttribute` is the only check that distinguishes
    // a missing attribute from the default reflected value (a <button>
    // without an explicit tabindex still reports `.tabIndex === 0`)
    // and is immune to React's prop-to-attribute camelCase translation.
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
