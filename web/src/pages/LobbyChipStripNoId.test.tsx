import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2036 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `id` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2623-2630 of LobbyPage.tsx, anchored externally
 * via its stable `className="lobby-chips"` and named for assistive tech
 * by a direct `aria-label="Filter by category"` (W1150).
 *
 * Sibling pins on this same `.lobby-chips` track:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - LobbyChipStripChildCount.test.tsx pins exact direct child count.
 *   - LobbyChipStripWrap.test.tsx pins the outer wrapper structure.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * chip-strip track itself. A future refactor that introduced e.g.
 * `id="lobby-chip-strip"` would silently:
 *   1. Create a stable URL fragment target (`/#lobby-chip-strip`) that
 *      external links and bookmarks could come to depend on, making it
 *      an undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from elsewhere on the
 *      page to point at the track, coupling sibling components to an
 *      attribute this codebase has deliberately not advertised.
 *   3. Risk a collision with the sibling drawer tablist or any other
 *      element on the page — jsdom and browsers tolerate duplicate ids
 *      at render time but `getElementById` and fragment scrolling break.
 *
 * One focused assertion: the inner `.lobby-chips` track MUST NOT carry
 * an `id` attribute. If a future change deliberately needs one, it
 * should add the new `id` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2023 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no id attribute (W2036)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent of
    // the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not, say, a
    // `.lobby-chips-arrow` overflow button (which has the chained
    // className) or the outer `.lobby-chips-wrap`. Without this guard a
    // future restructure that moved the className onto a wrapper could
    // pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `id` attribute on the chip-strip track.
    // Use `hasAttribute` rather than checking for an empty string —
    // an `id=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(strip!.hasAttribute("id")).toBe(false);
  });
});
