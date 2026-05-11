import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontimeupdate` attribute.
 *
 * `ontimeupdate` is the inline event-handler content attribute for the
 * media `timeupdate` event, which fires on `<audio>` and `<video>`
 * elements as their `currentTime` advances during playback. On a
 * `<div role="tablist">` it is meaningless:
 *  1. The chip strip is not a media element — it has no `currentTime`,
 *     no playback, and no `timeupdate` events will ever be dispatched
 *     to it by any user agent.
 *  2. Authoring `ontimeupdate="..."` as a content attribute opens an
 *     inline-script execution surface that bypasses the codebase's
 *     React event handlers and CSP posture; if a future regression
 *     templated user-controlled content into this attribute the result
 *     would be DOM-XSS on lobby render.
 *  3. Validators flag inline event-handler attributes on non-media
 *     elements as nonsensical, polluting CI accessibility / lint
 *     reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` pins: none of the sibling LobbyChipStripNo* pins
 * currently introspect `ontimeupdate`. A regression that added
 * `ontimeupdate="..."` to the tablist would slip past every existing
 * pin in the family.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ontimeupdate attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontimeupdate attribute", () => {
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

    // The pin: NO ontimeupdate attribute is authored on the chip strip.
    expect(track!.hasAttribute("ontimeupdate")).toBe(false);
    expect(track!.getAttribute("ontimeupdate")).toBeNull();
  });
});
