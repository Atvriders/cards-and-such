import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpause` attribute.
 *
 * `onpause` is the inline event-handler attribute for the HTML
 * `pause` media event, fired by `<audio>` / `<video>` elements when
 * playback is paused. On a `<div role="tablist">` it is meaningless:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a media element and dispatches no `pause`
 *     events, so `onpause` would never fire.
 *  2. An inline `onpause="..."` handler would be a CSP-violating
 *     inline-script vector slipping past existing event-handler pins.
 *  3. Validators (W3C Nu, html-validate) flag `onpause` on
 *     non-media elements as an invalid attribute.
 *
 * The pin: `track.hasAttribute("onpause") === false` and
 * `track.getAttribute("onpause") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpause attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpause attribute", () => {
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

    // The pin: NO onpause attribute is authored on the chip strip.
    expect(track!.hasAttribute("onpause")).toBe(false);
    expect(track!.getAttribute("onpause")).toBeNull();
  });
});
