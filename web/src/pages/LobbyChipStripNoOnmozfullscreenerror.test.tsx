import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmozfullscreenerror` attribute.
 *
 * `onmozfullscreenerror` is a legacy Mozilla-prefixed event handler
 * content attribute corresponding to the deprecated
 * `mozfullscreenerror` event (the unprefixed `fullscreenerror`
 * superseded it years ago). Authoring it on a `<div role="tablist">`
 * filter rail would be wrong because:
 *  1. The chip strip never enters/exits fullscreen — it is a
 *     horizontally-scrolling row of `role="tab"` buttons inside the
 *     lobby. There is no fullscreen request lifecycle for which a
 *     `mozfullscreenerror` handler would ever fire.
 *  2. The attribute is vendor-prefixed and deprecated. Modern code
 *     should use `onfullscreenerror` (and even that only on elements
 *     that actually request fullscreen). Authoring the moz-prefixed
 *     form is dead code that pollutes the DOM and confuses linters.
 *  3. Inline event-handler content attributes (`on*=""`) on a tablist
 *     are an anti-pattern — handlers should be wired via React props,
 *     not stamped as DOM string attributes.
 *
 * The pin: `track.hasAttribute("onmozfullscreenerror") === false` and
 * `track.getAttribute("onmozfullscreenerror") === null`. A regression
 * that added `onmozfullscreenerror="..."` to the chip strip would
 * fail here.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmozfullscreenerror attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmozfullscreenerror attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onmozfullscreenerror attribute is authored.
    expect(track!.hasAttribute("onmozfullscreenerror")).toBe(false);
    expect(track!.getAttribute("onmozfullscreenerror")).toBeNull();
  });
});
