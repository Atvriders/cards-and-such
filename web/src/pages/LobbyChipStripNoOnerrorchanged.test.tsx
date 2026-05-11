import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onerrorchanged` attribute.
 *
 * `onerrorchanged` is not a standard HTML/DOM event handler attribute
 * — it has no defined semantics on any element, let alone a
 * `<div role="tablist">`. Authoring it would either be inert noise
 * (most user agents) or, worse, accidentally bind a string-as-handler
 * that validators and CSP `script-src` policies would flag. A
 * regression that templated `onerrorchanged="..."` onto the chip
 * strip would slip past every existing global-attribute pin (which
 * each target one specific known attribute name) because no current
 * pin enumerates this exact name.
 *
 * The pin: both `hasAttribute("onerrorchanged") === false` and
 * `getAttribute("onerrorchanged") === null` — the two canonical
 * primitives for asserting absence of a named attribute.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onerrorchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onerrorchanged attribute", () => {
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

    // The pin: NO onerrorchanged attribute is authored on the chip strip.
    expect(track!.hasAttribute("onerrorchanged")).toBe(false);
    expect(track!.getAttribute("onerrorchanged")).toBeNull();
  });
});
