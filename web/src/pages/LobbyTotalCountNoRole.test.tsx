import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2226 — the lobby-hero total-count line (the `<p class="lobby-sub"
 * data-testid="lobby-total-count">` rendered around line 1856 of
 * LobbyPage.tsx) MUST NOT carry a `role` attribute. As a native `<p>`
 * paragraph element it already carries the implicit ARIA role
 * "paragraph"; assigning an explicit `role` is at best redundant and at
 * worst silently overrides the implicit semantics for assistive tech.
 *
 * Sibling pins on this same total-count element:
 *   - LobbyHeroTotalCount.test.tsx pins the rendered text content
 *     ("<GAMES.length> games and counting — …").
 *   - LobbyTotalCountNoStyle.test.tsx pins the absence of an inline
 *     `style` attribute on this paragraph.
 *   - LobbyTotalCountNoId.test.tsx pins the absence of an `id`
 *     attribute on this paragraph (W2167).
 *
 * None of those sibling pins cover the ABSENCE of a `role` attribute
 * on the total-count paragraph ITSELF. A future refactor that
 * introduced e.g. `role="status"` (to make the games-count an ARIA
 * live region), `role="note"`, `role="doc-subtitle"`, or
 * `role="presentation"` would silently:
 *   1. Change the announced semantics for screen-reader users without
 *      any test catching it — `role="status"` in particular would
 *      cause the count to be announced live every time the lobby
 *      remounts, which is a real UX shift, not a no-op refactor.
 *   2. `role="presentation"` (or `role="none"`) would strip the
 *      paragraph's implicit semantics entirely, hiding the text from
 *      the document's structural outline for AT users.
 *   3. Couple the lobby's a11y contract to a string-typed attribute
 *      that React happily accepts but does not type-check, expanding
 *      the surface area of behaviour this component is on the hook
 *      for without an explicit test capturing the choice.
 *
 * One focused assertion: the lobby-total-count element MUST NOT carry
 * a `role` attribute. If a future change deliberately needs one (e.g.
 * promoting the count to a live region as `role="status"`), it should
 * add the new attribute AND update this pin in the same commit, making
 * the a11y trade-off explicit and reviewable.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established LobbyTotalCountNoId / LobbyTotalCountNoStyle pattern so
 * the test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — total-count paragraph has no role attribute (W2226)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-total-count paragraph does NOT carry a role attribute", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const sub = getByTestId("lobby-total-count");

    // Sanity: confirm we pinned the hero subtitle paragraph itself and
    // not, say, a wrapper that some future restructure could re-target
    // the testid to. Without this guard a relocation onto an unidentified
    // wrapper could pass the no-role assertion vacuously.
    expect(sub.tagName).toBe("P");
    expect(sub.classList.contains("lobby-sub")).toBe(true);

    // The actual contract: no `role` attribute on the total-count
    // paragraph. Use `hasAttribute` rather than reading `.getAttribute`
    // alone (which returns null for missing AND empty roles in some
    // serialisations) so that a stray `role=""` regression — itself a
    // public attribute surface that `[role]` CSS / query selectors
    // would match — would still fail this pin.
    expect(sub.hasAttribute("role")).toBe(false);
  });
});
