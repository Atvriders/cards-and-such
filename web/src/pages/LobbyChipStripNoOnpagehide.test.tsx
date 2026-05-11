import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3324 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpagehide` attribute.
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
 * `onpagehide` is an inline event-handler content attribute defined
 * by the HTML standard only on `<body>` (and, by reflection, on
 * `Window`). It fires when the user agent unloads or freezes the
 * page (bfcache eviction, navigation away, tab close). On a
 * `<div role="tablist">` it is meaningless: the spec restricts
 * the `onpagehide` handler reflection to the `Window`/`<body>` axis,
 * so no user agent will dispatch a `pagehide` event at a
 * descendant `<div>`. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no lifecycle relationship with the document
 *     unload pipeline, so there is no `pagehide` event to handle.
 *  2. Validators (W3C Nu, html-validate) flag `onpagehide` on
 *     non-body elements as an unknown/invalid attribute, polluting
 *     CI accessibility/HTML reports.
 *  3. A stray `onpagehide="..."` would imply the filter rail is
 *     trying to run unload-side-effect script on tab close, which
 *     is both inert (no event fires) and a security smell (inline
 *     JS attribute, CSP `unsafe-inline` requirement, XSS sink).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onpagehide`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onpagehide` (page-unload event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy/event attribute's absence — none of
 *    them currently cover `onpagehide`. A regression that added
 *    `onpagehide="..."` (e.g. by mistakenly templating a
 *    body-scoped unload handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onpagehide") === false` and
 * `track.getAttribute("onpagehide") === null`. `hasAttribute`
 * (rather than only `getAttribute(...) === null`) is the canonical
 * primitive for asserting absence of an inline event-handler
 * attribute — `onpagehide=""` with an empty value is still authored,
 * and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpagehide attribute (W3324)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpagehide attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO onpagehide attribute is authored on the chip strip.
    // A regression that adds `onpagehide=""`, `onpagehide="..."`, or
    // any other inline page-unload handler binding would fail here.
    expect(track!.hasAttribute("onpagehide")).toBe(false);
    expect(track!.getAttribute("onpagehide")).toBe(null);
  });
});
