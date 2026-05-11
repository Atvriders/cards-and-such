import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onactivate` attribute.
 *
 * `onactivate` is a legacy DOM Level 2 / SVG event-handler attribute
 * that fires on the now-deprecated `DOMActivate` event. It is not a
 * valid HTML5 global event handler — modern user agents do not
 * dispatch `DOMActivate`, and authoring `onactivate="..."` on an
 * arbitrary `<div role="tablist">` would:
 *  1. Encode an inline event handler string, which is a CSP /
 *     `unsafe-inline` red flag and an XSS vector.
 *  2. Wire behaviour to a deprecated event that no browser reliably
 *     fires for keyboard or pointer activation of a tab.
 *  3. Bypass React's synthetic-event system entirely, since React
 *     does not normalize `onactivate` — the attribute would be set
 *     verbatim on the DOM node.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — scoped to the
 * chip filter strip rather than any sibling tablist in the tree.
 *
 * The pin asserts BOTH `hasAttribute("onactivate") === false` AND
 * `getAttribute("onactivate") === null` to catch any regression that
 * authors the attribute with any string value (including the empty
 * string, which `hasAttribute` would still treat as present).
 */
describe("LobbyPage — .lobby-chips tablist has no onactivate attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onactivate attribute", () => {
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

    // The pin: NO onactivate attribute is authored on the chip strip.
    expect(track!.hasAttribute("onactivate")).toBe(false);
    expect(track!.getAttribute("onactivate")).toBe(null);
  });
});
