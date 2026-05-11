import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpresentationterminate` attribute.
 *
 * `onpresentationterminate` is not a standard HTML event handler
 * attribute. The Presentation API (PresentationConnection) exposes an
 * `onterminate` event handler on the JavaScript object — not as an
 * inline HTML attribute on a DOM element, and never with the name
 * `onpresentationterminate`. Authoring it on the chip strip would be
 * meaningless: no user agent dispatches a `presentationterminate`
 * event to a `<div>`, no spec consumer interprets the attribute, and
 * validators would flag it as an unknown attribute polluting CI
 * accessibility/lint reports. The chip strip is a flex/scroll
 * container of `role="tab"` buttons — it has no relationship to the
 * Presentation API, casting, or remote-display termination semantics.
 *
 * The pin: `track.hasAttribute("onpresentationterminate") === false`
 * AND `track.getAttribute("onpresentationterminate") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpresentationterminate attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpresentationterminate attribute", () => {
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

    // The pin: NO onpresentationterminate attribute is authored on the
    // chip strip. A regression that adds it in any form fails here.
    expect(track!.hasAttribute("onpresentationterminate")).toBe(false);
    expect(track!.getAttribute("onpresentationterminate")).toBeNull();
  });
});
