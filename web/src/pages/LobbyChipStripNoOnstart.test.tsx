import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onstart` attribute.
 *
 * `onstart` is not a standard HTML event-handler content attribute on
 * `<div>`. It is associated historically with SMIL animation
 * elements (e.g. `<animate>`, `<animateMotion>`) where it fires when
 * the animation begins, and with the obsolete `<marquee>` element.
 * On a `<div role="tablist">` it is meaningless: no user agent will
 * dispatch an "onstart" event to the chip-strip track. Authoring it
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not an animation or marquee element.
 *  2. Validators flag unknown event-handler attributes as invalid,
 *     and any inline JS body would constitute a CSP violation and a
 *     latent XSS sink.
 *  3. A stray `onstart="..."` would be silently ignored by the
 *     browser, hiding a developer mistake behind dead code.
 *
 * The pin: `track.hasAttribute("onstart") === false` and
 * `track.getAttribute("onstart") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onstart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onstart attribute", () => {
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

    // The pin: NO onstart attribute is authored on the chip strip.
    expect(track!.hasAttribute("onstart")).toBe(false);
    expect(track!.getAttribute("onstart")).toBe(null);
  });
});
