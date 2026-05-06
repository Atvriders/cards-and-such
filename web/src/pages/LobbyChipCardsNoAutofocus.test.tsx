import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2621 — the LobbyPage `chip-cards` Chip <button> MUST NOT carry an
 * `autofocus` attribute. The Chip helper (LobbyPage.tsx) renders the
 * per-category chips inside the strip-level `CATEGORY_ORDER.map`; none
 * of those chips opt-in to native HTML autofocus, and the `cards`
 * branch is no exception.
 *
 * Sibling pins on `chip-cards` already in the suite cover OTHER
 * attributes but NOT the `autofocus`-attribute absence:
 *   - LobbyChipCardsNoStyle (W2529) pins `style`-attribute absence.
 *   - LobbyChipCardsNoId pins the `id`-attribute absence.
 *   - LobbyChipCardsNoAriaControls pins `aria-controls` absence.
 *   - LobbyChipCardsNoAriaDisabled pins `aria-disabled` absence.
 *   - LobbyChipCardsNoAriaLabel pins `aria-label` absence.
 *   - LobbyChipCardsAriaPressedDefault and
 *     LobbyChipCardsAriaSelectedDefault pin the toggle-state ARIA
 *     defaults but say nothing about autofocus.
 *   - LobbyChipCardsType pins the explicit `type="button"`.
 *
 * Why the absence of `autofocus` matters here:
 *   1. `autofocus` on a category chip would steal focus from the page
 *      heading or the search field on every initial mount, breaking
 *      keyboard-navigation expectations and screen-reader landmark
 *      announcement order — assistive tech users rely on focus
 *      starting at document top, not deep inside a filter strip.
 *   2. Multiple `autofocus` elements on a route mount produce
 *      undefined, browser-specific focus behavior; pinning the
 *      absence on `chip-cards` keeps the route's focus contract
 *      single-sourced (e.g. an explicit `useEffect` + `ref.focus()`
 *      somewhere intentional, not a sprinkled HTML attribute).
 *   3. Per-category regressions that added `autofocus` ONLY to the
 *      `cards` branch (e.g. via a conditional spread inside
 *      `CATEGORY_ORDER.map` when `cat === "cards"`) would slip past
 *      every other chip-cards pin unless the absence is asserted
 *      directly.
 *
 * Resolves the chip via its stable `data-testid="chip-cards"`
 * (rendered through `testId={`chip-${cat}`}`) so the assertion is
 * locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-cards button has no autofocus attribute (W2621)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-cards <button> does NOT carry an autofocus attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards");

    // Sanity: confirm we pinned the actual chip-cards <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `autofocus` attribute on chip-cards.
    // Use `hasAttribute` rather than inspecting the IDL `.autofocus`
    // property — `hasAttribute` is the only check that distinguishes
    // a missing attribute from a falsy reflected property and is
    // immune to React's prop-to-attribute camelCase translation.
    expect(chip.hasAttribute("autofocus")).toBe(false);
  });
});
