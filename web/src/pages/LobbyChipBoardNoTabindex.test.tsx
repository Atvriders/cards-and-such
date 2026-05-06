import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2715 — the LobbyPage `chip-board` Chip <button> MUST NOT carry a
 * `tabindex` attribute. The Chip helper (LobbyPage.tsx) renders the
 * per-category chips inside the strip-level `CATEGORY_ORDER.map`; the
 * filter strip relies on the browser's NATURAL tab order between
 * sibling <button>s rather than a roving-tabindex pattern, so no chip
 * (board included) should expose an explicit `tabindex` attribute.
 *
 * Sibling pins on `chip-board` already in the suite cover OTHER
 * attributes but NOT the `tabindex`-attribute absence:
 *   - LobbyChipBoardNoStyle pins the `style`-attribute absence.
 *   - LobbyChipBoardNoId pins the `id`-attribute absence.
 *   - LobbyChipBoardNoForm pins the `form`-attribute absence.
 *   - LobbyChipBoardNoName pins the `name`-attribute absence.
 *   - LobbyChipBoardNoAutofocus pins `autofocus`-attribute absence.
 *   - LobbyChipBoardNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipBoardNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipBoardNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipBoardAriaPressedDefault and
 *     LobbyChipBoardAriaSelectedDefault pin the toggle-state ARIA
 *     defaults but say nothing about tabindex.
 *
 * Why the absence of `tabindex` matters here:
 *   1. The drawer rows above the chip strip use a roving-tabindex
 *      pattern (`tabIndex={drawerFocusIdx === ... ? 0 : -1}`). If a
 *      regression accidentally extended that pattern down into the
 *      filter chip strip, only ONE chip would be reachable per Tab
 *      press, breaking the "Tab through every category" expectation
 *      keyboard users rely on.
 *   2. `tabindex="-1"` on chip-board would silently remove it from
 *      the natural tab order — keyboard users could no longer reach
 *      the "Board" filter by Tab alone, and the only other discovery
 *      path (the drawer link) might be hidden behind a collapse.
 *   3. Positive `tabindex` values (e.g. `tabindex="1"`) reorder the
 *      page's focus traversal globally and are an established a11y
 *      anti-pattern; pinning the absence catches such regressions
 *      regardless of the specific numeric value chosen.
 *
 * Resolves the chip via its stable `data-testid="chip-board"`
 * (rendered through `testId={`chip-${cat}`}`) so the assertion is
 * locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-board button has no tabindex attribute (W2715)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-board <button> does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-board");

    // Sanity: confirm we pinned the actual chip-board <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (spans have no implicit tabindex anyway).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `tabindex` attribute on chip-board.
    // Use `hasAttribute` rather than inspecting the IDL `.tabIndex`
    // property — every focusable element exposes a numeric `.tabIndex`
    // even when no `tabindex` HTML attribute is set, so only
    // `hasAttribute` distinguishes "attribute absent" from "attribute
    // explicitly set to 0". This is also immune to React's
    // prop-to-attribute camelCase translation (`tabIndex` → `tabindex`).
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
