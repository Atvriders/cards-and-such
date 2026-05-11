import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerlockstate` attribute.
 *
 * `onpointerlockstate` is not a standard inline event handler attribute
 * on HTML elements. The Pointer Lock API exposes a
 * `pointerlockchange` (and `pointerlockerror`) event on `document`,
 * not on arbitrary DOM nodes, and there is no
 * `onpointerlockstate` IDL attribute on HTMLElement. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons. It never requests a pointer lock, and the Pointer Lock
 *     API has no "state" event named `pointerlockstate`.
 *  2. Validators (W3C Nu, html-validate) would flag the unknown
 *     attribute, polluting CI reports.
 *  3. A stray `onpointerlockstate="..."` would imply this element is
 *     a pointer-lock target, confusing tooling that introspects DOM
 *     event-handler attributes.
 *
 * The pin: `track.hasAttribute("onpointerlockstate") === false` AND
 * `track.getAttribute("onpointerlockstate") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerlockstate attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerlockstate attribute", () => {
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

    // The pin: NO onpointerlockstate attribute is authored on the
    // chip strip.
    expect(track!.hasAttribute("onpointerlockstate")).toBe(false);
    expect(track!.getAttribute("onpointerlockstate")).toBe(null);
  });
});
