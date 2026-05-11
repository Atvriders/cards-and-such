import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onhide` attribute.
 *
 * `onhide` is not a standard HTML event-handler attribute. It is
 * neither defined by the HTML Living Standard global event-handler
 * surface (onclick, onkeydown, etc.) nor by ARIA. Authoring it on a
 * `<div role="tablist">` would be meaningless: no user agent dispatches
 * an `hide` event to plain divs, and no inline-handler attribute named
 * `onhide` exists in the spec. A stray `onhide="..."` on the chip
 * strip would:
 *  1. Pollute validator output (W3C Nu, html-validate) as an unknown
 *     attribute.
 *  2. Imply behavior (a hide-event hook) that the chip-strip does not
 *     and should not implement — the filter rail is always visible
 *     while LobbyPage is mounted.
 *  3. Mislead any tooling that scrapes inline event handlers (CSP
 *     audits, XSS scanners) into thinking the tablist binds a script
 *     handler.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onhide attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onhide attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onhide attribute is authored on the chip strip.
    expect(track!.hasAttribute("onhide")).toBe(false);
    expect(track!.getAttribute("onhide")).toBeNull();
  });
});
