import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2642 — the LobbyPage `chip-hidden` Chip <button> MUST NOT carry an
 * `autofocus` attribute. The Chip helper renders a plain `<button>` with
 * no `autoFocus` prop forwarded onto the per-category chip wrapper,
 * leaving initial focus management to the browser's native landing-on-page
 * behavior (and to any explicit focus-restoration hooks higher in the
 * tree).
 *
 * Sibling pins on `chip-hidden` already in the suite cover OTHER
 * attributes but NOT the `autofocus`-attribute absence:
 *   - LobbyChipHiddenNoStyle pins the `style`-attribute absence.
 *   - LobbyChipHiddenNoId pins the `id`-attribute absence.
 *   - LobbyChipHiddenNoAriaControls / NoAriaDisabled / NoAriaLabel pin
 *     ARIA-attribute absences.
 *   - LobbyChipHiddenType pins `type="button"`.
 *   - LobbyChipHiddenAriaPressedDefault pins the default ARIA state.
 *   - LobbyChipHiddenRole pins the implicit button role surface.
 *   - LobbyChipHiddenGlyphAria pins glyph aria.
 *
 * Why the absence of `autofocus` matters here:
 *   1. The lobby is the application landing route. An `autofocus` on a
 *      category chip would steal focus from the document body the moment
 *      the SPA mounts, breaking screen-reader landmark navigation that
 *      relies on starting at the top of the page.
 *   2. The `chip-hidden` filter reveals normally-hidden games — silently
 *      autofocusing it on mount could disclose the existence of that
 *      surface to assistive-tech users who never asked to traverse it.
 *   3. If `chip-hidden` autofocused, scroll-restoration on back/forward
 *      navigation would jump the strip into view, defeating the route's
 *      remembered scroll offset (the lobby strip explicitly persists its
 *      scroll position to localStorage).
 *   4. Multiple chips share the same render path; an `autofocus` on one
 *      would set a precedent that a regression could quietly extend to
 *      siblings, producing duplicate-autofocus warnings in React.
 *   5. Mobile browsers treat `autofocus` on a non-input element as a
 *      hint to suppress soft-keyboard popups inconsistently — keeping
 *      it absent preserves predictable cross-platform behavior.
 *
 * Resolves the chip via its stable `data-testid="chip-hidden"` (rendered
 * through `testId="chip-hidden"` at LobbyPage.tsx ~L1961) so the
 * assertion is locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-hidden button has no autofocus attribute (W2642)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-hidden <button> does NOT carry an autofocus attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden");

    // Sanity: confirm we pinned the actual chip-hidden <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (spans never autofocus regardless).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `autofocus` attribute on chip-hidden. Use
    // `hasAttribute` rather than inspecting the `autofocus` IDL property
    // — React strips/normalizes `autoFocus` in ways that can mask the
    // serialized DOM-attribute presence, and CSP / SSR diff tooling
    // inspects the literal attribute, not the reflected property.
    expect(chip.hasAttribute("autofocus")).toBe(false);
  });
});
