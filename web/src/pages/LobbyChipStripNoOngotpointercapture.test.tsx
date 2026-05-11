import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3225 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ongotpointercapture` attribute.
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
 * `ongotpointercapture` is a legacy/inline event-handler attribute
 * corresponding to the `gotpointercapture` Pointer Events event. When
 * authored as an HTML attribute on an element it would install an
 * inline handler that fires when the element captures a pointer (e.g.
 * via `setPointerCapture`). On a `<div role="tablist">` filter rail it
 * is meaningless and unwanted because:
 *  1. The chip strip does not call `setPointerCapture` on itself — it
 *     is a horizontally-scrolling flex container of `role="tab"`
 *     buttons. There is no pointer-capture lifecycle on the track.
 *  2. Inline `on*` attributes execute string-body handlers in the page
 *     scope, bypassing React's synthetic event system and any CSP
 *     `script-src` policy that disallows inline scripts. Authoring
 *     `ongotpointercapture="..."` on the track would silently
 *     introduce a CSP-violating inline script.
 *  3. The component already wires all pointer/touch/wheel/scroll
 *     interaction through React event props (`onPointerDown`,
 *     `onWheel`, `onScroll`, etc.) on the appropriate children — a
 *     stray inline `ongotpointercapture` would double-bind behavior
 *     and confuse devtools/event-listener inspectors.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `ongotpointercapture`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `ongotpointercapture`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote-source URL) and silent on
 *    `ongotpointercapture` (pointer-capture inline handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `ongotpointercapture`. A regression that added
 *    `ongotpointercapture="..."` (e.g. by mistakenly templating an
 *    inline pointer-capture handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("ongotpointercapture") === false` AND
 * `track.getAttribute("ongotpointercapture") === null`. `hasAttribute`
 * is the canonical primitive for asserting absence of an authored
 * attribute — `ongotpointercapture=""` with an empty value is still
 * authored, and any string value is a regression. The dual
 * `getAttribute(...) === null` assertion is belt-and-braces against
 * any DOM impl that diverges on empty-value semantics.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ongotpointercapture attribute (W3225)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ongotpointercapture attribute", () => {
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

    // The pin: NO ongotpointercapture attribute is authored on the
    // chip strip. A regression that adds `ongotpointercapture=""`,
    // `ongotpointercapture="doSomething()"`, or any other inline
    // pointer-capture handler binding would fail here.
    expect(track!.hasAttribute("ongotpointercapture")).toBe(false);
    expect(track!.getAttribute("ongotpointercapture")).toBeNull();
  });
});
