import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2282 — the lobby-hero total-count line (the `<p class="lobby-sub"
 * data-testid="lobby-total-count">` rendered around line 1856 of
 * LobbyPage.tsx) MUST NOT carry a `tabindex` attribute.
 *
 * Sibling pins on this same total-count element:
 *   - LobbyHeroTotalCount.test.tsx pins the rendered text content
 *     ("<GAMES.length> games and counting — …").
 *   - LobbyTotalCountNoStyle.test.tsx pins the absence of an inline
 *     `style` attribute.
 *   - LobbyTotalCountNoId.test.tsx pins the absence of an `id`
 *     attribute.
 *   - LobbyTotalCountNoRole.test.tsx pins the absence of an explicit
 *     `role` attribute.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the total-count paragraph. A future refactor that introduced e.g.
 * `tabIndex={0}` (perhaps to make the count "focusable for screen
 * readers") or `tabIndex={-1}` (to make it a programmatic focus
 * target for an "after filter applied" announcement) would silently:
 *   1. Insert the paragraph into the keyboard-navigation order or
 *      focus graph of the lobby hero, changing the perceived UX for
 *      every sighted keyboard user without any test catching it.
 *   2. Add an interactive-style affordance to a non-interactive
 *      `<p>` element, which assistive tech may then misannounce as
 *      a focusable widget.
 *   3. Defeat the convention in this file that decorative copy in
 *      the lobby hero is NOT focusable — every sibling no-tabindex
 *      pin (LobbyChipStripNoTabindex, LobbyChipsWrapNoTabindex,
 *      LobbyDrawerAsideNoTabIndex, LobbyPageRootNoTabindex) relies
 *      on this same contract.
 *
 * One focused assertion: the lobby-total-count element MUST NOT carry
 * a `tabindex` attribute. If a future change deliberately needs one
 * (e.g. for a managed-focus "results updated" announcement), it
 * should add the new attribute AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established LobbyTotalCountNoId / LobbyTotalCountNoStyle pattern
 * so the test shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — total-count paragraph has no tabindex attribute (W2282)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-total-count paragraph does NOT carry a tabindex attribute", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const sub = getByTestId("lobby-total-count");

    // Sanity: confirm we pinned the hero subtitle paragraph itself and
    // not, say, a wrapper that some future restructure could re-target
    // the testid to. Without this guard a relocation onto an
    // unidentified wrapper could pass the no-tabindex assertion
    // vacuously.
    expect(sub.tagName).toBe("P");
    expect(sub.classList.contains("lobby-sub")).toBe(true);

    // The actual contract: no `tabindex` attribute on the total-count
    // paragraph. Use `hasAttribute` rather than inspecting
    // `.tabIndex` (which defaults to -1 for elements that have NEVER
    // had a tabindex attribute set, conflating "absent" with
    // "explicitly tabindex='-1'") so a stray `tabIndex={-1}`
    // regression — itself a focus-graph public surface — would
    // still fail this pin.
    expect(sub.hasAttribute("tabindex")).toBe(false);
  });
});
