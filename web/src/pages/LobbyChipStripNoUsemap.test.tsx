import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2898 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry a
 * `usemap` attribute. The track is the inner `<div role="tablist">` rendered
 * around line 2623-2630 of LobbyPage.tsx; `usemap` is a legacy HTML
 * attribute that wires an `<img>`/`<object>` element to a client-side
 * image-map (`<map name="...">`) for hot-spot navigation, and it has no
 * meaningful effect on a `<div>` element.
 *
 * Sibling pins on this same `.lobby-chips` track:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - LobbyChipStripChildCount.test.tsx pins exact direct child count.
 *   - LobbyChipStripWrap.test.tsx pins the outer wrapper structure.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *   - W2112 / LobbyChipStripNoStyle.test.tsx pins absence of `style`.
 *   - LobbyChipStripNoHref / NoTarget / NoDownload pin link attrs absent.
 *
 * What none of those cover is the ABSENCE of a `usemap` attribute on the
 * chip-strip track. A future refactor that introduced e.g.
 * `usemap="#chips-map"` for a pictorial filter strip would silently:
 *   1. Promise image-map hot-spot semantics on a `<div>` where the HTML
 *      spec only honors `usemap` on `<img>` / `<object>`, producing dead
 *      attributes that AT validators flag.
 *   2. Smuggle a parallel navigation surface (the `<map>` `area` href
 *      list) past the established tablist contract, undermining the
 *      `role="tablist"` + tab-key nav pattern this strip relies on.
 *   3. Re-introduce the document-wide named-element lookup that `<map
 *      name="...">` triggers, polluting `document.querySelector` callers
 *      that scan for tablist controls.
 *
 * One focused assertion: the inner `.lobby-chips` track MUST NOT carry a
 * `usemap` attribute. If a future change deliberately needs an image-map
 * binding (it should not — switch the element type first), it should add
 * the new attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 / W2112 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no usemap attribute (W2898)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a usemap attribute", () => {
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

    // The actual contract: no `usemap` attribute on the chip-strip track.
    // Use `hasAttribute` rather than reading the property — `usemap` is
    // not reflected onto a generic HTMLElement (only HTMLImageElement /
    // HTMLObjectElement expose `.useMap`), so a property check would
    // silently report `undefined` even if the raw attribute were set.
    expect(strip!.hasAttribute("usemap")).toBe(false);
  });
});
