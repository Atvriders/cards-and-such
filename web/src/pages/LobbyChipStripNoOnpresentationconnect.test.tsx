import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpresentationconnect` attribute.
 *
 * `onpresentationconnect` is an inline event-handler content attribute
 * associated with the Presentation API (`PresentationRequest` /
 * `PresentationConnection`). It is meaningful only on elements that
 * participate in a presentation session — a `<div role="tablist">`
 * filter rail does not. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no presentation session lifecycle.
 *  2. Inline event-handler attributes are a CSP-hostile pattern that
 *     bypass React's synthetic event system and leak HTML-string
 *     handlers into the DOM.
 *  3. A stray `onpresentationconnect="..."` would imply the filter
 *     rail is wired to a second-screen presentation connection, which
 *     is nonsensical for a chip strip.
 *
 * The pin: `track.hasAttribute("onpresentationconnect") === false`
 * AND `track.getAttribute("onpresentationconnect") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onpresentationconnect attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpresentationconnect attribute", () => {
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

    // The pin: NO onpresentationconnect attribute is authored on the
    // chip strip. A regression that adds
    // `onpresentationconnect="..."` would fail here.
    expect(track!.hasAttribute("onpresentationconnect")).toBe(false);
    expect(track!.getAttribute("onpresentationconnect")).toBeNull();
  });
});
