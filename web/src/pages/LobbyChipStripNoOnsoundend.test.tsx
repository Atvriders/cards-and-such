import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsoundend` attribute.
 *
 * `onsoundend` is a legacy DOM event-handler content attribute
 * historically associated with media / speech-synthesis-style
 * elements. On a `<div role="tablist">` chip filter strip it is
 * meaningless: the element emits no `soundend` event, no user agent
 * dispatches one to it, and authoring `onsoundend="..."` on the
 * tablist would only register a dead inline event handler whose
 * callback can never fire. It also pollutes the DOM with an inline
 * handler string — a CSP / XSS-hygiene smell that every modern
 * audit (axe, html-validate, CSP "unsafe-inline" reports) flags.
 *
 * The pin: `track.hasAttribute("onsoundend") === false` AND
 * `track.getAttribute("onsoundend") === null`. Both primitives are
 * asserted: `hasAttribute` catches an authored empty-value
 * `onsoundend=""`, and `getAttribute(...) === null` is the
 * canonical "no value" assertion. Together they make a regression
 * that adds the attribute in any form (empty, string handler,
 * inline JS) fail loudly.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — the same
 * stable className anchor used by the sibling `LobbyChipStripNo*`
 * pins, scoped specifically to the chip filter strip and not to
 * any other tablist in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onsoundend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsoundend attribute", () => {
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

    // The pin: NO onsoundend attribute is authored on the chip strip.
    expect(track!.hasAttribute("onsoundend")).toBe(false);
    expect(track!.getAttribute("onsoundend")).toBeNull();
  });
});
