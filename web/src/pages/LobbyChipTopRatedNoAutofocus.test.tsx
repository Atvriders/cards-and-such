import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2644 — the LobbyPage `chip-top-rated` Chip <button> MUST NOT carry an
 * `autofocus` attribute. The Chip helper renders a plain `<button>` with
 * no `autoFocus` prop forwarded onto the per-category chip wrapper,
 * leaving initial focus management to the browser's native landing-on-page
 * behavior (and to any explicit focus-restoration hooks higher in the
 * tree).
 *
 * Sibling pins on `chip-top-rated` already in the suite cover OTHER
 * attributes but NOT the `autofocus`-attribute absence:
 *   - LobbyChipTopRatedNoStyle pins the `style`-attribute absence.
 *   - LobbyChipTopRatedNoId pins the `id`-attribute absence.
 *   - LobbyChipTopRatedNoAriaControls / NoAriaDisabled / NoAriaLabel pin
 *     ARIA-attribute absences.
 *   - LobbyChipTopRatedType pins `type="button"`.
 *   - LobbyChipTopRatedRole pins the implicit button role surface.
 *   - LobbyChipTopRatedGlyphAria pins the glyph aria contract.
 *
 * Why the absence of `autofocus` matters here:
 *   1. The lobby is the application landing route. An `autofocus` on a
 *      category chip would steal focus from the document body the moment
 *      the SPA mounts, breaking screen-reader landmark navigation that
 *      relies on starting at the top of the page.
 *   2. If `chip-top-rated` autofocused, scroll-restoration on back/forward
 *      navigation would jump the strip into view, defeating the route's
 *      remembered scroll offset (the lobby strip explicitly persists its
 *      scroll position to localStorage).
 *   3. Multiple chips share the same render path; an `autofocus` on one
 *      would set a precedent that a regression could quietly extend to
 *      siblings, producing duplicate-autofocus warnings in React.
 *   4. Mobile browsers treat `autofocus` on a non-input element as a
 *      hint to suppress soft-keyboard popups inconsistently — keeping
 *      it absent preserves predictable cross-platform behavior.
 *
 * Resolves the chip via its stable `data-testid="chip-top-rated"` so the
 * assertion is locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-top-rated button has no autofocus attribute (W2644)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-top-rated <button> does NOT carry an autofocus attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated");

    // Sanity: confirm we pinned the actual chip-top-rated <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (spans never autofocus regardless).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `autofocus` attribute on chip-top-rated. Use
    // `hasAttribute` rather than inspecting the `autofocus` IDL property
    // — React strips/normalizes `autoFocus` in ways that can mask the
    // serialized DOM-attribute presence, and CSP / SSR diff tooling
    // inspects the literal attribute, not the reflected property.
    expect(chip.hasAttribute("autofocus")).toBe(false);
  });
});
