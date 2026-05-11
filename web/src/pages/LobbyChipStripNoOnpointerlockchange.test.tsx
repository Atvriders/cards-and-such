import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerlockchange` attribute.
 *
 * `onpointerlockchange` is a Pointer Lock API event handler that
 * fires on `document` when pointer lock state changes. It is not a
 * meaningful inline attribute on a `<div role="tablist">` filter
 * rail — the chip strip neither requests pointer lock nor needs to
 * react to pointer-lock state changes. Authoring it would be wrong:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons. No tab interaction triggers `requestPointerLock`.
 *  2. The pointer-lock change event fires on `document`, not on
 *     arbitrary descendants — an inline `onpointerlockchange` on
 *     a div is dead code that confuses tooling.
 *  3. Validators flag unknown inline event handlers on non-relevant
 *     elements.
 *
 * The pin: `track.hasAttribute("onpointerlockchange") === false`
 * AND `track.getAttribute("onpointerlockchange") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped to the chip
 * filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerlockchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerlockchange attribute", () => {
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

    // The pin: NO onpointerlockchange attribute is authored on the
    // chip strip. A regression that adds `onpointerlockchange=""`
    // or any inline handler binding would fail here.
    expect(track!.hasAttribute("onpointerlockchange")).toBe(false);
    expect(track!.getAttribute("onpointerlockchange")).toBeNull();
  });
});
