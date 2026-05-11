import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerlock` attribute.
 *
 * `onpointerlock` is not a standard inline event handler attribute —
 * the Pointer Lock API exposes `pointerlockchange` and
 * `pointerlockerror` events on `document`, not as inline-attribute
 * handlers on arbitrary elements. Authoring `onpointerlock="..."` on
 * a `<div role="tablist">` is meaningless: no user agent dispatches a
 * raw "pointerlock" event to an element, and the attribute would sit
 * inert in the DOM, polluting validator output and confusing static
 * analyzers that scan for inline handler bindings.
 *
 * The pin asserts:
 *   - `track.hasAttribute("onpointerlock") === false`
 *   - `track.getAttribute("onpointerlock") === null`
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerlock attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerlock attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: this is the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onpointerlock attribute is authored on the chip strip.
    expect(track!.hasAttribute("onpointerlock")).toBe(false);
    expect(track!.getAttribute("onpointerlock")).toBeNull();
  });
});
