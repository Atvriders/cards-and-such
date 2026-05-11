import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3246 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onfullscreenchange` attribute.
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
 * `onfullscreenchange` is the inline event-handler content attribute
 * for the Fullscreen API's `fullscreenchange` event — it fires on an
 * element when it (or a descendant) enters or exits fullscreen mode
 * via `Element.requestFullscreen()` / `Document.exitFullscreen()`. On
 * a `<div role="tablist">` chip filter strip it is meaningless:
 *  1. The chip strip never enters fullscreen — it is a horizontal
 *     flex-scroll container of `role="tab"` filter buttons, not a
 *     media surface, canvas, video element, or game viewport. There
 *     is no UX flow that requests fullscreen on the filter rail.
 *  2. Inline `on*` handler attributes are an anti-pattern in a React
 *     app — event wiring goes through React's synthetic event system
 *     (`onClick`, `onKeyDown`, etc. as JSX props compiled into
 *     `addEventListener` calls), not stringified HTML attributes that
 *     would execute via the legacy inline-handler evaluator.
 *  3. A stray `onfullscreenchange="..."` attribute would be a
 *     mini-CSP-bypass / inline-script vector — any string assigned to
 *     it is parsed and executed as JavaScript by the user agent when
 *     the corresponding event fires, defeating strict CSP policies
 *     that disallow `unsafe-inline`.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onfullscreenchange`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on inline handler attributes.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onfullscreenchange` (Fullscreen API event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global / legacy / inline-handler attribute's absence
 *    — none of them currently cover `onfullscreenchange`. A
 *    regression that added `onfullscreenchange="alert(1)"` (e.g. by
 *    mistakenly templating a fullscreen-listener attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onfullscreenchange") === false` AND
 * `track.getAttribute("onfullscreenchange") === null`.
 * Both primitives are asserted to defend against the two ways the
 * attribute could regress in: `hasAttribute` catches a bare authored
 * attribute (even with an empty value), `getAttribute` catches any
 * stringified handler body.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onfullscreenchange attribute (W3246)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onfullscreenchange attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
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

    // The pin: NO onfullscreenchange attribute is authored on the
    // chip strip. A regression that adds `onfullscreenchange=""`,
    // `onfullscreenchange="handleFs()"`, or any other inline
    // Fullscreen API event-handler binding would fail here.
    expect(track!.hasAttribute("onfullscreenchange")).toBe(false);
    expect(track!.getAttribute("onfullscreenchange")).toBeNull();
  });
});
