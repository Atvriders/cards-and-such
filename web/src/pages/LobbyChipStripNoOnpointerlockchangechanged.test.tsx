import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerlockchangechanged` attribute.
 *
 * `onpointerlockchangechanged` is not a valid HTML/DOM event handler
 * attribute. The real Pointer Lock API event is `pointerlockchange`
 * (fired on `document`), exposed via the `onpointerlockchange`
 * property. There is no `onpointerlockchangechanged` in any spec or
 * user agent — authoring it on the chip strip would be meaningless:
 *  1. No browser dispatches a `pointerlockchangechanged` event, so a
 *     content-attribute handler with that name would never fire.
 *  2. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it never requests or releases pointer lock, so even
 *     the real `onpointerlockchange` would be wrong here; the doubled
 *     "changed" variant is doubly wrong.
 *  3. Stray unknown `on*` attributes pollute the DOM, confuse
 *     accessibility/lint tooling, and risk colliding with future spec
 *     additions or framework-injected listeners.
 *
 * The pin: `track.hasAttribute("onpointerlockchangechanged") === false`
 * and `track.getAttribute("onpointerlockchangechanged") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerlockchangechanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerlockchangechanged attribute", () => {
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

    // The pin: NO onpointerlockchangechanged attribute is authored.
    expect(track!.hasAttribute("onpointerlockchangechanged")).toBe(false);
    expect(track!.getAttribute("onpointerlockchangechanged")).toBeNull();
  });
});
