import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3291 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ononline` attribute.
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
 * `ononline` is a Window-level event handler attribute (paired with
 * `onoffline`) — the HTML spec exposes it as an IDL attribute on
 * `WindowEventHandlers`, and as a content attribute it is only valid
 * on `<body>` and `<frameset>` (the document-level surfaces that
 * forward to the `Window` event target). On a `<div role="tablist">`
 * it is meaningless: the inline event handler does not bind to the
 * div, the browser will not dispatch `online` events to a `<div>`,
 * and no UA, screen reader, or spec consumer interprets `ononline`
 * on a non-body/non-frameset element. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a document-level surface, so there is no
 *     valid event-handler binding point for `online`.
 *  2. Validators (W3C Nu, html-validate, axe) flag `ononline` on
 *     non-body/non-frameset elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `ononline="location.reload()"` would imply the filter
 *     rail wants to react to network reconnection, confusing tooling
 *     that introspects inline event handlers (e.g. CSP auditors,
 *     XSS sinks, security scanners that flag inline handlers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `ononline`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `ononline`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `ononline`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `ononline` (Window online-event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy/event-handler attribute's absence — none
 *    of them currently cover `ononline`. A regression that added
 *    `ononline="..."` (e.g. by mistakenly templating a body-level
 *    network handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("ononline") === false`
 * AND `track.getAttribute("ononline") === null`. `hasAttribute`
 * (rather than just `getAttribute(...) === null`) is the canonical
 * primitive for asserting absence of an inline event-handler
 * attribute — `ononline` with an empty value is still authored, and
 * any string value is a regression. Pairing it with
 * `getAttribute(...) === null` provides redundant coverage against
 * shimmed DOM implementations.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ononline attribute (W3291)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ononline attribute", () => {
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

    // The pin: NO ononline attribute is authored on the chip strip.
    // A regression that adds `ononline=""`, `ononline="location.reload()"`,
    // or any other Window online-event handler binding would fail here.
    expect(track!.hasAttribute("ononline")).toBe(false);
    expect(track!.getAttribute("ononline")).toBeNull();
  });
});
