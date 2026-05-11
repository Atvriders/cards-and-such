import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onplay` attribute.
 *
 * `onplay` is a legacy HTML event-handler content attribute whose only
 * meaningful hosts are media elements (`<audio>`, `<video>`). It fires
 * when playback of media begins. On a `<div role="tablist">` it is
 * meaningless: there is no media to play, no playback lifecycle, and no
 * user agent will ever dispatch a `play` event to this element. A stray
 * `onplay="..."` would be:
 *  1. Inert at runtime — divs do not emit `play` events.
 *  2. Flagged by HTML validators as an event handler on a
 *     non-media element.
 *  3. A potential XSS vector if user-controlled content were ever
 *     interpolated into such an attribute.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped to the chip filter
 * strip specifically.
 */
describe("LobbyPage — .lobby-chips tablist has no onplay attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onplay attribute", () => {
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

    // The pin: NO onplay attribute is authored on the chip strip.
    expect(track!.hasAttribute("onplay")).toBe(false);
    expect(track!.getAttribute("onplay")).toBeNull();
  });
});
