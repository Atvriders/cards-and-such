import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2634 — the LobbyPage `chip-arcade` Chip <button> MUST NOT carry an
 * `autofocus` attribute. The Chip helper (LobbyPage.tsx ~L2651) renders
 * a plain `<button>` with no `autoFocus` prop forwarded onto the
 * per-category chip wrapper, leaving initial focus management to the
 * browser's native landing-on-page behavior (and to any explicit
 * focus-restoration hooks higher in the tree).
 *
 * Sibling pins on `chip-arcade` already in the suite cover OTHER
 * attributes but NOT the `autofocus`-attribute absence:
 *   - LobbyChipArcadeNoStyle pins the `style`-attribute absence.
 *   - LobbyChipArcadeNoId pins the `id`-attribute absence.
 *   - LobbyChipArcadeNoAriaControls / NoAriaDisabled / NoAriaLabel pin
 *     ARIA-attribute absences.
 *   - LobbyChipArcadeType pins `type="button"`.
 *   - LobbyChipArcadeAriaPressedDefault / AriaSelectedDefault pin the
 *     default ARIA state.
 *   - LobbyChipArcadeRole pins the implicit button role surface.
 *   - LobbyChipArcadeBadge / GlyphAria pin badge text + glyph aria.
 *
 * Why the absence of `autofocus` matters here:
 *   1. The lobby is the application landing route. An `autofocus` on a
 *      category chip would steal focus from the document body the moment
 *      the SPA mounts, breaking screen-reader landmark navigation that
 *      relies on starting at the top of the page.
 *   2. If `chip-arcade` autofocused, scroll-restoration on back/forward
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
 * Resolves the chip via its stable `data-testid="chip-arcade"` (rendered
 * through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970) so the
 * assertion is locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-arcade button has no autofocus attribute (W2634)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-arcade <button> does NOT carry an autofocus attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-arcade");

    // Sanity: confirm we pinned the actual chip-arcade <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (spans never autofocus regardless).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `autofocus` attribute on chip-arcade. Use
    // `hasAttribute` rather than inspecting the `autofocus` IDL property
    // — React strips/normalizes `autoFocus` in ways that can mask the
    // serialized DOM-attribute presence, and CSP / SSR diff tooling
    // inspects the literal attribute, not the reflected property.
    expect(chip.hasAttribute("autofocus")).toBe(false);
  });
});
