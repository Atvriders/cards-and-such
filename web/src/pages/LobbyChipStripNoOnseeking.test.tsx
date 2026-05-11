import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onseeking` attribute.
 *
 * `onseeking` is a media-element event-handler content attribute (it
 * fires on `<video>` / `<audio>` when the user agent begins a seek
 * operation). On a `<div role="tablist">` it is meaningless:
 *  1. The chip strip is not a media element — it has no playback
 *     timeline and cannot dispatch `seeking` events.
 *  2. Authoring `onseeking="..."` on a non-media element is an
 *     inline event handler with a body that will never run, but the
 *     attribute string itself is still parsed as IDL and exposed to
 *     DOM tooling, polluting attribute introspection.
 *  3. Validators flag stray media-event handlers on non-media hosts
 *     as suspicious / likely XSS-payload smuggling.
 *
 * The pin: `track.hasAttribute("onseeking") === false` AND
 * `track.getAttribute("onseeking") === null`. Both forms are checked
 * to guard against any regression that authors `onseeking=""` or any
 * string value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onseeking attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onseeking attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are introspecting the chip-strip tablist.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onseeking attribute is authored on the chip strip.
    expect(track!.hasAttribute("onseeking")).toBe(false);
    expect(track!.getAttribute("onseeking")).toBeNull();
  });
});
