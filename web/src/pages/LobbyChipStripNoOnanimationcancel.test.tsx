import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pins absence of the legacy inline-event-handler attribute
 * `onanimationcancel` on the inner chip-strip track `.lobby-chips`
 * (the `<div role="tablist">` filter rail rendered inside
 * LobbyPage.tsx).
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
 * `onanimationcancel` is the HTML inline-event-handler attribute
 * counterpart of the `animationcancel` DOM event, which fires when a
 * CSS animation is cancelled before completion. Authoring an inline
 * `onanimationcancel="..."` on the chip strip would be wrong because:
 *  1. The project wires animation listeners (where needed) via React
 *     synthetic events / `addEventListener`, never via inline
 *     `on*=` HTML attributes — inline handlers are stringly-typed,
 *     bypass CSP `script-src`, and defeat type-checking.
 *  2. The chip strip is a filter rail. Even if it animates (e.g. a
 *     transform on selection), nothing listens for animation-cancel
 *     here; a stray attribute would imply a side-effect that does not
 *     exist, confusing readers and DOM-introspecting tooling.
 *  3. CSP-strict deployments reject inline event handlers; a
 *     regression that added `onanimationcancel="..."` would surface
 *     only at runtime under strict CSP, after merge.
 *
 * The pin: `track.hasAttribute("onanimationcancel") === false` AND
 * `track.getAttribute("onanimationcancel") === null`. Together these
 * cover both the "attribute authored with empty value" case and the
 * "attribute fully absent" case.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onanimationcancel attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onanimationcancel attribute", () => {
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

    // The pin: NO onanimationcancel attribute is authored on the chip
    // strip. Both `hasAttribute` and `getAttribute` checks are asserted
    // so that neither `onanimationcancel=""` nor any string value can
    // slip past.
    expect(track!.hasAttribute("onanimationcancel")).toBe(false);
    expect(track!.getAttribute("onanimationcancel")).toBe(null);
  });
});
