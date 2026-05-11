import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforefocus` attribute.
 *
 * `onbeforefocus` is not a defined DOM event-handler content attribute
 * in any HTML/DOM specification. Authoring it on the chip strip would
 * be wrong because:
 *  1. It is not a standard event handler — browsers will not wire any
 *     focus-precursor logic from it, so its presence is dead weight at
 *     best and a confusing red herring at worst.
 *  2. Validators (W3C Nu, html-validate) flag unknown `on*` attributes
 *     as invalid, polluting CI accessibility reports.
 *  3. A stray `onbeforefocus="..."` value would imply inline JS that
 *     would never execute, silently breaking any developer mental model
 *     that depended on it firing.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforefocus attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforefocus attribute", () => {
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

    // The pin: NO onbeforefocus attribute is authored on the chip strip.
    expect(track!.hasAttribute("onbeforefocus")).toBe(false);
    expect(track!.getAttribute("onbeforefocus")).toBeNull();
  });
});
