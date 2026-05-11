import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmozfullscreenchange` attribute.
 *
 * `onmozfullscreenchange` is a legacy Mozilla-prefixed event handler
 * attribute corresponding to the deprecated `mozfullscreenchange`
 * event. The standardized handler is `onfullscreenchange` (which is
 * also independently pinned elsewhere). On a `<div role="tablist">`
 * filter rail, neither the prefixed nor unprefixed fullscreen-change
 * handler has any meaning — the chip strip never enters/exits
 * fullscreen, and exposing a vendor-prefixed legacy event hook here
 * would be pure cruft.
 *
 * The pin: `track.hasAttribute("onmozfullscreenchange") === false` and
 * `track.getAttribute("onmozfullscreenchange") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped to the chip filter
 * strip specifically.
 */
describe("LobbyPage — .lobby-chips tablist has no onmozfullscreenchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmozfullscreenchange attribute", () => {
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

    // The pin: NO onmozfullscreenchange attribute is authored on the
    // chip strip — neither presence nor any string value.
    expect(track!.hasAttribute("onmozfullscreenchange")).toBe(false);
    expect(track!.getAttribute("onmozfullscreenchange")).toBeNull();
  });
});
