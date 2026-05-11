import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmozanimationstart` attribute.
 *
 * `onmozanimationstart` is a legacy Gecko-prefixed inline event handler
 * attribute for the prefixed `MozAnimationStart` event — the unprefixed
 * `animationstart` event (and its `onanimationstart` attribute) is the
 * modern standardized form. Authoring `onmozanimationstart` on the
 * tablist track would be wrong because:
 *  1. It is a vendor-prefixed legacy attribute long since superseded by
 *     `onanimationstart`; modern Gecko fires the unprefixed event.
 *  2. Inline event-handler attributes are the wrong abstraction here —
 *     the component wires interaction via React props, not authored
 *     IDL attributes. A stray `onmozanimationstart="..."` would imply
 *     a string-based handler, conflicting with the React event model.
 *  3. CSP policies that forbid inline event handlers would reject this
 *     attribute, breaking the page in hardened deployments.
 *
 * Anchor: `document.querySelector(".lobby-chips")` keeps the pin scoped
 * to the chip filter strip specifically.
 */
describe("LobbyPage — .lobby-chips tablist has no onmozanimationstart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmozanimationstart attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onmozanimationstart attribute is authored on the
    // chip strip. A regression that adds `onmozanimationstart="..."`
    // would fail here.
    expect(track!.hasAttribute("onmozanimationstart")).toBe(false);
    expect(track!.getAttribute("onmozanimationstart")).toBeNull();
  });
});
