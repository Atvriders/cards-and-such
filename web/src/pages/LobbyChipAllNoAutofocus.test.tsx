import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2647 — the LobbyPage `chip-all` Chip <button> MUST NOT carry an
 * `autofocus` attribute. The Chip helper in LobbyPage.tsx renders a
 * plain `<button>` with no `autoFocus` prop forwarded onto the
 * "all" category chip wrapper, leaving initial focus management to
 * the browser's native landing-on-page behavior (and to any explicit
 * focus-restoration hooks higher in the tree).
 *
 * Sibling pins on `chip-all` already in the suite cover OTHER
 * attributes but NOT the `autofocus`-attribute absence:
 *   - LobbyChipAllNoStyle pins the `style`-attribute absence.
 *   - LobbyChipAllNoId pins the `id`-attribute absence.
 *   - LobbyChipAllNoAriaControls / NoAriaLabel pin ARIA-attribute absences.
 *   - LobbyChipAllRole pins the implicit button role surface.
 *   - LobbyAllChipBadge pins the badge text/markup.
 *
 * Why the absence of `autofocus` matters here:
 *   1. The lobby is the application landing route. An `autofocus` on the
 *      "all" filter chip would steal focus from the document body the
 *      moment the SPA mounts, breaking screen-reader landmark navigation
 *      that relies on starting at the top of the page.
 *   2. If `chip-all` autofocused, scroll-restoration on back/forward
 *      navigation would jump the chip strip into view, defeating the
 *      route's remembered scroll offset (the lobby strip explicitly
 *      persists its scroll position to localStorage).
 *   3. Multiple chips share the same render path; an `autofocus` on the
 *      default-selected "all" chip would set a precedent that a regression
 *      could quietly extend to siblings, producing duplicate-autofocus
 *      warnings in React.
 *   4. Mobile browsers treat `autofocus` on a non-input element as a hint
 *      to suppress soft-keyboard popups inconsistently — keeping it absent
 *      preserves predictable cross-platform behavior.
 *
 * Resolves the chip via its stable `data-testid="chip-all"` (rendered
 * through `testId="chip-all"` at LobbyPage.tsx ~L1935) so the assertion
 * is locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-all button has no autofocus attribute (W2647)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-all <button> does NOT carry an autofocus attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all");

    // Sanity: confirm we pinned the actual chip-all <button> wrapper and
    // not a descendant span. A future restructure that moved the testid
    // down onto an inner glyph span could otherwise pass this assertion
    // vacuously (spans never autofocus regardless).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `autofocus` attribute on chip-all. Use
    // `hasAttribute` rather than inspecting the `autofocus` IDL property
    // — React strips/normalizes `autoFocus` in ways that can mask the
    // serialized DOM-attribute presence, and CSP / SSR diff tooling
    // inspects the literal attribute, not the reflected property.
    expect(chip.hasAttribute("autofocus")).toBe(false);
  });
});
