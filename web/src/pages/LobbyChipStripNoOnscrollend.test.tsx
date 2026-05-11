import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onscrollend` attribute.
 *
 * `onscrollend` is a global scroll-event handler attribute fired when
 * a scroll operation on the element (or document) completes. Authoring
 * `onscrollend="..."` directly on the tablist track would:
 *  1. Bind inline JavaScript event-handler code as a string attribute,
 *     which violates strict CSP policies (no `unsafe-inline` for
 *     event handlers) and is also out-of-band with the React event
 *     system used everywhere else in this component.
 *  2. Implicitly couple imperative scroll-end DOM logic to the chip
 *     strip's authored markup, when scroll-end behavior (if any)
 *     belongs in a React `useEffect` that adds/removes a listener via
 *     `addEventListener("scrollend", ...)`.
 *  3. Be silently ignored by older browsers that do not implement
 *     `scrollend`, while still polluting the rendered DOM with a stray
 *     handler-string attribute that lint/validators flag.
 *
 * The pin asserts both:
 *  - `hasAttribute("onscrollend") === false` (canonical absence check)
 *  - `getAttribute("onscrollend") === null`  (defense in depth — an
 *    empty `onscrollend=""` would still be authored)
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onscrollend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onscrollend attribute", () => {
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

    // The pin: NO onscrollend attribute is authored on the chip strip.
    expect(track!.hasAttribute("onscrollend")).toBe(false);
    expect(track!.getAttribute("onscrollend")).toBe(null);
  });
});
