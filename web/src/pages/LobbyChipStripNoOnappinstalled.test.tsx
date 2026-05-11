import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3300 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onappinstalled` attribute.
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
 * `onappinstalled` is the inline event-handler content attribute
 * corresponding to the `appinstalled` event — a `WindowEventHandlers`
 * mixin event fired on the global `Window` object when a Progressive
 * Web App has been successfully installed by the user agent. The only
 * valid host for `onappinstalled` as a content attribute is
 * `<body>` (where global `WindowEventHandlers` attributes are
 * authored), and even there it is almost always wired via
 * `window.addEventListener("appinstalled", ...)` instead. On a
 * `<div role="tablist">` it is meaningless because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons inside the lobby page — it is not the document body
 *     and it does not host `WindowEventHandlers` events. A
 *     PWA-install lifecycle handler authored here would never fire.
 *  2. Validators (W3C Nu, html-validate, axe) flag `onappinstalled`
 *     on non-body elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. Inline `onappinstalled="..."` attributes are an XSS / CSP
 *     footgun — any string value is executed as JavaScript when the
 *     PWA-install event fires on a matching scope, so a stray
 *     templating accident on the chip rail could smuggle script
 *     execution into the lobby surface.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onappinstalled`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onappinstalled`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onappinstalled` (PWA-install event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy/event attribute's absence — none of
 *    them currently cover `onappinstalled`. A regression that added
 *    `onappinstalled="..."` (e.g. by mistakenly templating a
 *    PWA-install-lifecycle handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onappinstalled") === false` AND
 * `track.getAttribute("onappinstalled") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence
 * of an inline event-handler content attribute — `onappinstalled`
 * with an empty value is still authored, and any string value is a
 * regression. The paired `getAttribute(...) === null` check
 * defends against any host that might return an empty string for
 * an absent attribute.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onappinstalled attribute (W3300)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onappinstalled attribute", () => {
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

    // The pin: NO onappinstalled attribute is authored on the chip strip.
    // A regression that adds `onappinstalled=""`,
    // `onappinstalled="doSomething()"`, or any other PWA-install
    // lifecycle handler binding would fail here.
    expect(track!.hasAttribute("onappinstalled")).toBe(false);
    expect(track!.getAttribute("onappinstalled")).toBeNull();
  });
});
