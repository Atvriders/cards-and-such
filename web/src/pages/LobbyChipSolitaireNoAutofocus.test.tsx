import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2640 — the LobbyPage `chip-solitaire` Chip <button> MUST NOT carry an
 * `autofocus` attribute. The Chip helper (LobbyPage.tsx ~L2651) renders
 * a plain `<button>` with no `autoFocus` prop forwarded onto the
 * per-category chip wrapper, leaving initial focus management to the
 * browser's native landing-on-page behavior (and to any explicit
 * focus-restoration hooks higher in the tree).
 *
 * Sibling pins on `chip-solitaire` already in the suite cover OTHER
 * attributes but NOT the `autofocus`-attribute absence:
 *   - LobbyChipSolitaireNoStyle pins the `style`-attribute absence.
 *   - LobbyChipSolitaireNoId pins the `id`-attribute absence.
 *   - LobbyChipSolitaireNoAriaControls / NoAriaDisabled / NoAriaLabel pin
 *     ARIA-attribute absences.
 *   - LobbyChipSolitaireType pins `type="button"`.
 *   - LobbyChipSolitaireAriaSelectedDefault pins the default ARIA state.
 *   - LobbyChipSolitaireRole pins the implicit button role surface.
 *   - LobbyChipSolitaireGlyphAria pins the glyph aria contract.
 *
 * Why the absence of `autofocus` matters here:
 *   1. The lobby is the application landing route. An `autofocus` on a
 *      category chip would steal focus from the document body the moment
 *      the SPA mounts, breaking screen-reader landmark navigation that
 *      relies on starting at the top of the page.
 *   2. Solitaire is the most-played family in the lobby; an `autofocus`
 *      regression here would scroll the chip strip into view on every
 *      mount, defeating the route's remembered scroll offset (the lobby
 *      strip explicitly persists its scroll position to localStorage).
 *   3. Multiple chips share the same render path; an `autofocus` on one
 *      would set a precedent that a regression could quietly extend to
 *      siblings, producing duplicate-autofocus warnings in React.
 *   4. Mobile browsers treat `autofocus` on a non-input element as a
 *      hint to suppress soft-keyboard popups inconsistently — keeping
 *      it absent preserves predictable cross-platform behavior.
 *
 * Resolves the chip via its stable `data-testid="chip-solitaire"` (rendered
 * through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970) so the
 * assertion is locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-solitaire button has no autofocus attribute (W2640)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-solitaire <button> does NOT carry an autofocus attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire");

    // Sanity: confirm we pinned the actual chip-solitaire <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (spans never autofocus regardless).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `autofocus` attribute on chip-solitaire. Use
    // `hasAttribute` rather than inspecting the `autofocus` IDL property
    // — React strips/normalizes `autoFocus` in ways that can mask the
    // serialized DOM-attribute presence, and CSP / SSR diff tooling
    // inspects the literal attribute, not the reflected property.
    expect(chip.hasAttribute("autofocus")).toBe(false);
  });
});
