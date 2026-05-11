import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3222 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerleave` attribute.
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
 * `onpointerleave` is the legacy inline-handler form of the
 * `pointerleave` Pointer Events event. As an authored HTML attribute it
 * would serialize a JavaScript string ("onpointerleave='...'") onto the
 * element, which is wrong on this chip strip because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — its pointer-driven interactions (drag-scroll, hover
 *     fades, edge-fade gating) are wired up via React's synthetic
 *     event system in LobbyPage.tsx, not via inline `onpointerleave="..."`
 *     attributes. Authoring an inline handler would double-bind the
 *     event or, worse, inject a parallel imperative handler that
 *     bypasses React's batching / cleanup contract.
 *  2. Inline event-handler attributes are a known CSP / XSS surface:
 *     an `onpointerleave="..."` string is executed as JavaScript by
 *     the user agent regardless of `script-src` policy unless
 *     `unsafe-inline` is explicitly disallowed via `script-src-attr`.
 *     Pinning its absence keeps the chip strip free of inline-handler
 *     attack surface.
 *  3. Validators (W3C Nu, html-validate) and CSP linters flag inline
 *     event-handler attributes on non-interactive container elements
 *     as a code-smell — the chip strip is a `role="tablist"`
 *     container, not an interactive button, so authoring
 *     `onpointerleave` here is semantically nonsensical.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onpointerleave`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onpointerleave`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` (a legacy
 *    quote-source URL attribute) — orthogonal to `onpointerleave`
 *    (a Pointer Events inline handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy/event attribute's absence — none of
 *    them currently cover `onpointerleave`. A regression that added
 *    `onpointerleave="..."` (e.g. by mistakenly templating an inline
 *    Pointer Events handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onpointerleave") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of an inline event-handler
 * attribute — `onpointerleave` with an empty value is still authored,
 * and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerleave attribute (W3222)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerleave attribute", () => {
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

    // The pin: NO onpointerleave attribute is authored on the chip
    // strip. A regression that adds `onpointerleave=""`,
    // `onpointerleave="handler(event)"`, or any other inline Pointer
    // Events handler binding would fail here.
    expect(track!.hasAttribute("onpointerleave")).toBe(false);
    expect(track!.getAttribute("onpointerleave")).toBeNull();
  });
});
