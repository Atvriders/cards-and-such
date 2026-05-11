import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onloadeddata` attribute.
 *
 * `onloadeddata` is a media-element event handler attribute whose only
 * valid hosts are `<audio>` and `<video>` (and `<source>`-driven media
 * playback). It fires when the user agent has loaded enough media data
 * for the current playback position to be rendered. On a
 * `<div role="tablist">` the attribute is meaningless: no media is
 * loading on a flex/scroll container of `role="tab"` buttons, so the
 * handler can never fire. A stray inline `onloadeddata="..."` on the
 * chip strip would be:
 *  1. Dead code at best — the event never fires on a non-media element.
 *  2. A potential XSS sink at worst — an inline event-handler attribute
 *     authored from untrusted input is a classic injection vector.
 *  3. A validator failure — html-validate / W3C Nu flag inline event
 *     handlers on non-media elements as inappropriate.
 *
 * The pin: `track.hasAttribute("onloadeddata") === false` AND
 * `track.getAttribute("onloadeddata") === null`. Both forms together
 * catch any regression that authors the attribute with any value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onloadeddata attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onloadeddata attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onloadeddata attribute is authored on the chip strip.
    expect(track!.hasAttribute("onloadeddata")).toBe(false);
    expect(track!.getAttribute("onloadeddata")).toBeNull();
  });
});
