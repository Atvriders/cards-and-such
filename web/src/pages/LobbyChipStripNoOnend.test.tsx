import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onend` attribute.
 *
 * `onend` is not a standard HTML event-handler attribute on a generic
 * `<div>` — it is meaningful only on a small set of media/speech
 * elements (e.g. `<track>` cue events, SpeechSynthesisUtterance,
 * MediaStreamTrack — none of which are HTML attribute hooks on a div).
 * Authoring `onend="..."` on the chip strip would be:
 *  1. A no-op as far as the platform is concerned (no event named
 *     `end` is dispatched to a flex/scroll container of role="tab"
 *     buttons), so the handler would never fire.
 *  2. A validator/lint smell — html-validate / axe / W3C Nu flag
 *     unknown event-handler attributes on non-applicable elements.
 *  3. A maintenance trap — a future reader might assume an `end`
 *     event lifecycle exists for the chip strip when it does not.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onend attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // The pin: NO onend attribute is authored on the chip strip.
    expect(track!.hasAttribute("onend")).toBe(false);
    expect(track!.getAttribute("onend")).toBeNull();
  });
});
