import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pins absence of the `onwebkitanimationiteration` inline event-handler
 * attribute on the `.lobby-chips` tablist track inside LobbyPage.tsx.
 *
 * `onwebkitanimationiteration` is the legacy WebKit-prefixed inline
 * handler for the `webkitAnimationIteration` DOM event (fired when a
 * CSS animation completes one iteration in WebKit-based engines). It
 * has no place on the chip-strip:
 *  1. Inline event-handler attributes (`on*=""`) are forbidden by any
 *     reasonable CSP and are a known XSS vector.
 *  2. The chip strip is a non-animating flex/scroll tablist — there is
 *     no CSS animation whose iteration boundary we want to observe.
 *  3. Even if we DID want to observe animation iterations, the modern,
 *     unprefixed `animationiteration` event (and React's
 *     `onAnimationIteration` prop, or `addEventListener`) is the
 *     correct API; the `webkit`-prefixed variant is legacy and should
 *     never be authored declaratively.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — keeps the pin
 * scoped to the chip filter strip and not any sibling tablist.
 */
describe("LobbyPage — .lobby-chips tablist has no onwebkitanimationiteration attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwebkitanimationiteration attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onwebkitanimationiteration attribute is authored.
    expect(track!.hasAttribute("onwebkitanimationiteration")).toBe(false);
    expect(track!.getAttribute("onwebkitanimationiteration")).toBeNull();
  });
});
