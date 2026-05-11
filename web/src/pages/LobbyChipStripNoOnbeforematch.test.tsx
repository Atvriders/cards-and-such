import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3312 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforematch` attribute.
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
 * `onbeforematch` is an HTML event-handler content attribute that
 * fires on an element with `hidden="until-found"` immediately before
 * the user agent reveals it (e.g. as part of in-page find-in-page or
 * scroll-to-text-fragment matching). It is meaningful only on
 * elements participating in the `hidden=until-found` reveal flow.
 * On the chip-strip tablist track it is meaningless:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons that is always visible — it never carries
 *     `hidden="until-found"`, so the `beforematch` event will never
 *     fire on it. Authoring an `onbeforematch` handler is dead code.
 *  2. Inline event-handler content attributes are a known XSS /
 *     content-security vector — pinning their absence on a stable
 *     UI anchor keeps the chip strip free of inline script bindings.
 *  3. A stray `onbeforematch="..."` would imply this element is part
 *     of a find-in-page reveal flow it does not participate in,
 *     misleading tooling that introspects DOM semantics.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onbeforematch`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onbeforematch`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quotation source URL) and
 *    silent on `onbeforematch` (find-in-page reveal handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onbeforematch`. A regression that added
 *    `onbeforematch="..."` (e.g. by mistakenly templating a
 *    find-in-page reveal handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onbeforematch") === false` AND
 * `track.getAttribute("onbeforematch") === null`. Using both
 * primitives belt-and-braces — `hasAttribute` catches any authored
 * presence (even `onbeforematch=""`), and `getAttribute(...) === null`
 * confirms absence from the attribute map.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforematch attribute (W3312)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforematch attribute", () => {
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

    // The pin: NO onbeforematch attribute is authored on the chip
    // strip. A regression that adds `onbeforematch=""`,
    // `onbeforematch="handler()"`, or any other inline reveal-event
    // binding would fail here.
    expect(track!.hasAttribute("onbeforematch")).toBe(false);
    expect(track!.getAttribute("onbeforematch")).toBe(null);
  });
});
