import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onseeked` attribute.
 *
 * `onseeked` is an inline event-handler attribute that fires only on
 * media elements (`<video>`, `<audio>`) when a seek operation
 * completes. On a `<div role="tablist">` it is meaningless: the
 * chip-strip is not a media element, never emits `seeked` events, and
 * authoring `onseeked` on it would either be silently ignored by user
 * agents or — worse — be interpreted as an attempted inline handler,
 * which is a CSP/XSS smell.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onseeked attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onseeked attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // The pin: NO onseeked attribute is authored on the chip strip.
    expect(track!.hasAttribute("onseeked")).toBe(false);
    expect(track!.getAttribute("onseeked")).toBeNull();
  });
});
