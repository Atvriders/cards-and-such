import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondevicechange` attribute.
 *
 * `ondevicechange` is the inline event-handler attribute for the
 * `devicechange` event fired by `navigator.mediaDevices` when the
 * set of available media input/output devices changes. Its only
 * valid host as a content attribute is `<body>` (it reflects the
 * `Window.ondevicechange` IDL handler). On a `<div role="tablist">`
 * it is meaningless: no user agent dispatches `devicechange` to a
 * `<div>`, and authoring `ondevicechange="..."` on the chip strip
 * would either be silently ignored or inline-eval'd as an unknown
 * handler — a vector for stray script execution and a sign of a
 * template regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondevicechange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondevicechange attribute", () => {
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

    // The pin: NO ondevicechange attribute is authored on the chip strip.
    expect(track!.hasAttribute("ondevicechange")).toBe(false);
    expect(track!.getAttribute("ondevicechange")).toBe(null);
  });
});
