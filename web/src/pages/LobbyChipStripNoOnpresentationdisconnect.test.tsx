import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpresentationdisconnect` attribute.
 *
 * The element's authored attribute set is intentionally minimal:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *
 * `onpresentationdisconnect` is an inline event-handler attribute tied
 * to the Presentation API (it fires when a `PresentationConnection`
 * transitions to the `closed`/`terminated` state on a second-screen /
 * remote display session). It is meaningless on a
 * `<div role="tablist">` chip strip because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons in the lobby page — it is not a presentation session
 *     surface and never participates in second-screen mirroring.
 *  2. Authoring it inline as an HTML attribute (rather than wiring
 *     via React's synthetic-event system) bypasses the React event
 *     model and pollutes the DOM with raw `on*` strings.
 *  3. A stray `onpresentationdisconnect="..."` would imply the filter
 *     rail handles Presentation API teardown, confusing tooling that
 *     introspects element capability surfaces.
 *
 * The pin:
 *   `track.hasAttribute("onpresentationdisconnect") === false`
 *   `track.getAttribute("onpresentationdisconnect") === null`
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpresentationdisconnect attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpresentationdisconnect attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element. The pin only carries weight if the element
    // is in fact the role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onpresentationdisconnect attribute is authored on
    // the chip strip. A regression that adds
    // `onpresentationdisconnect=""` or any handler string would fail
    // here.
    expect(track!.hasAttribute("onpresentationdisconnect")).toBe(false);
    expect(track!.getAttribute("onpresentationdisconnect")).toBeNull();
  });
});
