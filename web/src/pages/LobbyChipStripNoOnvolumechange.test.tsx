import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onvolumechange` attribute.
 *
 * `onvolumechange` is a media-element event-handler content attribute,
 * meaningful only on `<audio>` / `<video>` (HTMLMediaElement). It fires
 * when the media element's `volume` or `muted` property changes. On a
 * `<div role="tablist">` it is meaningless: there is no media volume
 * to mutate, no `volume` property, and no user agent will dispatch a
 * volumechange event on a non-media element. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — not a media element, so no volume state exists.
 *  2. An inline `onvolumechange="..."` handler on a non-media element
 *     is dead code that pollutes the DOM and risks CSP violations if
 *     it embeds an inline script string.
 *  3. Validators (W3C Nu, html-validate) flag media-only event-handler
 *     attributes on non-media elements as unknown attributes.
 *
 * The pin: `track.hasAttribute("onvolumechange") === false` AND
 * `track.getAttribute("onvolumechange") === null`. Both primitives
 * are asserted: `hasAttribute` catches `onvolumechange=""`, and
 * `getAttribute(...) === null` is the symmetric absence assertion.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onvolumechange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onvolumechange attribute", () => {
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

    // The pin: NO onvolumechange attribute is authored on the chip strip.
    expect(track!.hasAttribute("onvolumechange")).toBe(false);
    expect(track!.getAttribute("onvolumechange")).toBe(null);
  });
});
