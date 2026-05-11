import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmoztransitionend` attribute.
 *
 * `onmoztransitionend` is a legacy Mozilla-vendor-prefixed event
 * handler attribute for the pre-standard `MozTransitionEnd` event,
 * the Gecko precursor to the standardized `transitionend` event.
 * Modern Firefox dispatches the unprefixed `transitionend` event and
 * has since the prefix was dropped; authoring
 * `onmoztransitionend="..."` on a tablist filter rail would be
 * meaningless because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — its CSS transitions are handled (if at all) via the
 *     standard `transitionend` event, not the vendor-prefixed Mozilla
 *     legacy event.
 *  2. Inline event-handler attributes are a CSP / XSS-policy hazard —
 *     any `on*=` attribute is exactly the pattern a strict
 *     `script-src` policy without `'unsafe-inline'` forbids, and a
 *     stray vendor-prefixed handler would be a silent CSP violation
 *     on the lobby page.
 *  3. Validators (W3C Nu, html-validate) flag vendor-prefixed
 *     event-handler attributes as unknown attributes on the element,
 *     polluting CI accessibility / HTML-validity reports.
 *
 * The pin: `track.hasAttribute("onmoztransitionend") === false` and
 * `track.getAttribute("onmoztransitionend") === null`. A regression
 * that templated a Mozilla-prefixed transition-end handler onto the
 * filter rail would fail here.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmoztransitionend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmoztransitionend attribute", () => {
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

    // The pin: NO onmoztransitionend attribute is authored on the
    // chip strip.
    expect(track!.hasAttribute("onmoztransitionend")).toBe(false);
    expect(track!.getAttribute("onmoztransitionend")).toBeNull();
  });
});
