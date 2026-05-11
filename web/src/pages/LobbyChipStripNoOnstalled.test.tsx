import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onstalled` attribute.
 *
 * `onstalled` is the inline event-handler content attribute for the
 * media `stalled` event. Its only valid hosts are media elements —
 * `<audio>` and `<video>` — where it fires when the user agent is
 * trying to fetch media data but data is unexpectedly not forthcoming.
 * On a `<div role="tablist">` it is meaningless: the chip strip is
 * not a media element, it never loads a media resource, and no user
 * agent will ever dispatch a `stalled` event at it. Authoring
 * `onstalled="..."` on this div would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no media pipeline, no `src`, no `currentSrc`,
 *     and no `readyState`. There is no stall to handle.
 *  2. Inline event-handler content attributes execute their string
 *     value as JavaScript in the global scope, which is a known XSS /
 *     CSP-violation footgun. The lobby filter rail intentionally
 *     attaches all interaction via React props (`onClick`,
 *     `onKeyDown`, etc.) which become DOM-property listeners — never
 *     as serialized inline-handler attributes.
 *  3. Validators (W3C Nu, html-validate) flag `onstalled` on
 *     non-media elements as an unknown/invalid attribute, polluting
 *     CI accessibility and validity reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - The broad family of `LobbyChipStripNo*` pins each cover one
 *    specific global/legacy/event-handler attribute's absence. None
 *    currently cover the media-stall inline handler `onstalled`.
 *  - A regression that added `onstalled="..."` (e.g. by mistakenly
 *    templating a media-event handler onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("onstalled") === false` AND
 * `track.getAttribute("onstalled") === null`. Both primitives are
 * asserted because `hasAttribute` is the canonical absence check for
 * a content attribute, while `getAttribute(...) === null` guards
 * against any future shim that might surface a stringified handler.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onstalled attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onstalled attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element. The pin only carries weight if the element
    // is in fact the role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onstalled attribute is authored on the chip strip.
    // A regression that adds `onstalled=""`, `onstalled="foo()"`, or
    // any other inline media-stall handler binding would fail here.
    expect(track!.hasAttribute("onstalled")).toBe(false);
    expect(track!.getAttribute("onstalled")).toBe(null);
  });
});
