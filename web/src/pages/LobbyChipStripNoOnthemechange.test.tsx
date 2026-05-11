import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onthemechange` attribute.
 *
 * `onthemechange` is not a standardized HTML event-handler attribute;
 * no user agent fires a `themechange` event on arbitrary DOM elements,
 * and no spec defines this as a content attribute. Authoring it on
 * the chip strip would be wrong because:
 *  1. It is not a real event handler — browsers will not invoke it,
 *     so any string value is dead code in attribute form.
 *  2. Validators (W3C Nu, html-validate) flag unknown `on*`
 *     attributes as invalid, polluting CI reports.
 *  3. A stray `onthemechange="..."` could be misinterpreted by
 *     custom tooling or future libraries as an event hook, leading
 *     to surprising behavior or XSS-adjacent footguns when the
 *     attribute value is dynamically composed.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onthemechange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onthemechange attribute", () => {
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

    // The pin: NO onthemechange attribute is authored on the chip strip.
    expect(track!.hasAttribute("onthemechange")).toBe(false);
    expect(track!.getAttribute("onthemechange")).toBe(null);
  });
});
