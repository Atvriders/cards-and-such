import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncanplaythrough` attribute.
 *
 * `oncanplaythrough` is a media event-handler content attribute,
 * meaningful only on `<audio>` and `<video>` elements (where it fires
 * when the user agent estimates playback can complete without
 * buffering). On a non-media `<div role="tablist">` it is inert and
 * authoring it would be a regression — either a stray inline handler
 * or a templating mistake.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — same anchor as
 * the sibling NoCite / NoCoords pins, scoped to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncanplaythrough attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncanplaythrough attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we're anchored on the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO oncanplaythrough attribute is authored on the chip strip.
    expect(track!.hasAttribute("oncanplaythrough")).toBe(false);
    expect(track!.getAttribute("oncanplaythrough")).toBeNull();
  });
});
