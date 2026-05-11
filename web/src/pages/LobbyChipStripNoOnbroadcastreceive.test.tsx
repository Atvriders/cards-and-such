import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbroadcastreceive` attribute.
 *
 * `onbroadcastreceive` is not a standard HTML/DOM event handler
 * attribute. It is not defined in the HTML Living Standard, not in
 * the DOM event handler IDL attribute set, and is not interpreted by
 * any current browser. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it dispatches no broadcast events and has no
 *     broadcast receiver semantics.
 *  2. Validators (W3C Nu, html-validate, axe) flag unknown
 *     `on*`-prefixed attributes as invalid event handler bindings,
 *     polluting CI accessibility/HTML reports.
 *  3. A stray `onbroadcastreceive="..."` would be ignored by the
 *     browser but parsed as an arbitrary string attribute, confusing
 *     tooling that introspects DOM event-handler provenance.
 *
 * The pin: `track.hasAttribute("onbroadcastreceive") === false` AND
 * `track.getAttribute("onbroadcastreceive") === null`. A regression
 * that added `onbroadcastreceive=""` or any string value would fail.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbroadcastreceive attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbroadcastreceive attribute", () => {
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

    // The pin: NO onbroadcastreceive attribute is authored on the
    // chip strip.
    expect(track!.hasAttribute("onbroadcastreceive")).toBe(false);
    expect(track!.getAttribute("onbroadcastreceive")).toBeNull();
  });
});
