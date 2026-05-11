import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onwebkittransitionend` attribute.
 *
 * `onwebkittransitionend` is a legacy WebKit-prefixed inline event
 * handler attribute that mirrors the standard `ontransitionend`. It
 * was used historically to listen for the end of a CSS transition on
 * browsers shipping the `-webkit-` vendor prefix. The chip strip is
 * a flex/scroll container of `role="tab"` buttons whose transition
 * lifecycle (if any) belongs in CSS and JS handlers attached via
 * `addEventListener`, not as an inline HTML attribute. Authoring it
 * on the chip strip would be wrong because:
 *  1. Inline event handler attributes inject string-compiled code
 *     into the DOM, defeating CSP `script-src` policies that forbid
 *     inline scripts.
 *  2. WebKit-prefixed transition events are obsolete; all modern
 *     engines fire the unprefixed `transitionend` event.
 *  3. None of the chip-strip's transition behavior should be wired
 *     through legacy vendor-prefixed inline handlers; doing so would
 *     hide the listener from React's synthetic event system and from
 *     any future refactor that searches for `addEventListener`
 *     bindings.
 *
 * The pin: `track.hasAttribute("onwebkittransitionend") === false`
 * and `track.getAttribute("onwebkittransitionend") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onwebkittransitionend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwebkittransitionend attribute", () => {
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

    // The pin: NO onwebkittransitionend attribute is authored.
    expect(track!.hasAttribute("onwebkittransitionend")).toBe(false);
    expect(track!.getAttribute("onwebkittransitionend")).toBeNull();
  });
});
