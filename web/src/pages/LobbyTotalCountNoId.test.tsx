import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2167 — the lobby-hero total-count line (the `<p class="lobby-sub"
 * data-testid="lobby-total-count">` rendered around line 1856 of
 * LobbyPage.tsx) MUST NOT carry an `id` attribute. Its addressability is
 * owned entirely by the `data-testid="lobby-total-count"` selector.
 *
 * Sibling pins on this same total-count element:
 *   - LobbyHeroTotalCount.test.tsx pins the rendered text content
 *     ("<GAMES.length> games and counting — …").
 *   - LobbyTotalCountNoStyle.test.tsx pins the absence of an inline
 *     `style` attribute on this paragraph.
 *   - LobbyPageRootNoId.test.tsx uses lobby-total-count as a stable
 *     anchor while pinning the absence of an `id` on the page root —
 *     it does NOT assert anything about the total-count's own id.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * total-count paragraph ITSELF. A future refactor that introduced e.g.
 * `id="lobby-total-count"` or `id="games-counter"` for an
 * aria-describedby / aria-labelledby / scroll-anchor / fragment-link
 * relationship would silently:
 *   1. Create an additional public selector surface that other code
 *      (CSS `#id` rules, JS `getElementById`, anchor-link `#fragment`
 *      navigation) could come to depend on, doubling the number of
 *      identifiers the component is on the hook to keep stable.
 *   2. Risk duplicate-id HTML validation errors if the lobby is ever
 *      rendered alongside another component that reuses the same id
 *      (e.g. a sticky mini-header, a print view, a server-rendered
 *      preview), without any test failing.
 *   3. Defeat the established convention in this file that the
 *      lobby-total-count paragraph is addressed exclusively by its
 *      data-testid — the same convention every sibling pin relies on.
 *
 * One focused assertion: the lobby-total-count element MUST NOT carry
 * an `id` attribute. If a future change deliberately needs an id (e.g.
 * `aria-describedby` from a "what counts as a game?" tooltip), it
 * should add the new attribute AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2139 / LobbyTotalCountNoStyle / LobbyPageRootNoId
 * pattern so the test shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — total-count paragraph has no id attribute (W2167)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-total-count paragraph does NOT carry an id attribute", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const sub = getByTestId("lobby-total-count");

    // Sanity: confirm we pinned the hero subtitle paragraph itself and
    // not, say, a wrapper that some future restructure could re-target
    // the testid to. Without this guard a relocation onto an unidentified
    // wrapper could pass the no-id assertion vacuously.
    expect(sub.tagName).toBe("P");
    expect(sub.classList.contains("lobby-sub")).toBe(true);

    // The actual contract: no `id` attribute on the total-count
    // paragraph. Use `hasAttribute` rather than inspecting `.id` (which
    // returns "" for both a missing id and an explicit `id=""`) so that
    // a stray `id=""` regression — itself a public, addressable surface
    // for `[id]` selectors — would still fail this pin.
    expect(sub.hasAttribute("id")).toBe(false);
  });
});
