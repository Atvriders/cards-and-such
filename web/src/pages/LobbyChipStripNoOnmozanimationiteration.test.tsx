import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmozanimationiteration` attribute.
 *
 * `onmozanimationiteration` is a legacy Mozilla-prefixed inline event
 * handler attribute for the (vendor-prefixed) `MozAnimationIteration`
 * DOM event — the precursor to the now-standard `animationiteration`
 * event. Authoring it on the chip strip would be wrong because:
 *  1. It is a vendor-prefixed, non-standard attribute that has been
 *     superseded by the standard `onanimationiteration` handler.
 *  2. Modern Firefox (and every other engine) fires the unprefixed
 *     `animationiteration` event; the Moz-prefixed form is dead code.
 *  3. Inline event handler attributes are a CSP / XSS risk and are
 *     blocked under strict Content Security Policies that forbid
 *     inline script.
 *  4. The chip strip's animation lifecycle is managed via React refs
 *     and CSS — no inline event-handler attribute should ever appear
 *     on the rendered DOM node.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The sibling drawer
 * tablist lives elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped to the chip filter
 * strip.
 *
 * The pin: both `hasAttribute("onmozanimationiteration") === false`
 * AND `getAttribute("onmozanimationiteration") === null`. A regression
 * that adds `onmozanimationiteration="..."` would fail here.
 */
describe("LobbyPage — .lobby-chips tablist has no onmozanimationiteration attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmozanimationiteration attribute", () => {
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

    // The pin: NO onmozanimationiteration attribute is authored on the
    // chip strip.
    expect(track!.hasAttribute("onmozanimationiteration")).toBe(false);
    expect(track!.getAttribute("onmozanimationiteration")).toBeNull();
  });
});
