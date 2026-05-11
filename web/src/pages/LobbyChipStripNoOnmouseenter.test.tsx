import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmouseenter` attribute.
 *
 * The element's authored attribute set is intentionally minimal:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *
 * `onmouseenter` is an inline event-handler content attribute. In a
 * React codebase, hover behavior on a host element MUST be expressed
 * via the synthetic `onMouseEnter` prop (which React installs as a
 * delegated listener), never as a DOM-string `onmouseenter=`
 * attribute. An authored `onmouseenter="..."` on the chip strip
 * would be wrong because:
 *  1. Inline event-handler attributes execute their value as a
 *     string of JavaScript in the global scope — a CSP / XSS hazard
 *     and a layering violation against React's event system.
 *  2. The chip strip's hover affordances (if any) are owned by CSS
 *     `:hover` and by React handlers on the child chip buttons, not
 *     by a DOM-level mouseenter listener on the track itself.
 *  3. A regression that templated `onmouseenter="doSomething()"`
 *     onto the tablist would bypass React's synthetic event
 *     dispatch, double-fire alongside any React `onMouseEnter`, and
 *     break strict CSP environments.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmouseenter attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmouseenter attribute", () => {
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

    // The pin: NO onmouseenter attribute is authored on the chip strip.
    expect(track!.hasAttribute("onmouseenter")).toBe(false);
    expect(track!.getAttribute("onmouseenter")).toBe(null);
  });
});
