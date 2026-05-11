import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3270 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onunload` attribute.
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
 * `onunload` is a legacy inline event-handler attribute whose only
 * meaningful host is the `<body>` (and historically `<frameset>`)
 * element — it fires when the document/window is being unloaded so
 * that authors can run last-second teardown. On a
 * `<div role="tablist">` it is meaningless: the `unload` event does
 * not bubble or fire on arbitrary DOM elements, so an `onunload`
 * attribute on a chip-strip `<div>` is dead code that will never
 * execute. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body, and the `unload` event
 *     is not dispatched at `<div>` elements.
 *  2. Inline `on*` handler attributes embed executable JavaScript as
 *     string-valued attributes, which violates strict Content
 *     Security Policies (`script-src` without `'unsafe-inline'`) and
 *     defeats React's synthetic event system entirely.
 *  3. A stray `onunload="alert('bye')"` (or any other inline
 *     handler) would imply lifecycle code is attached to a non-window
 *     element, confusing tooling that introspects DOM event bindings
 *     (e.g. CSP linters, security scanners, accessibility auditors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onunload`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onunload`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onunload`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `onunload`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onunload`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onunload`. A regression that added
 *    `onunload="..."` (e.g. by mistakenly templating a body-level
 *    teardown handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onunload") === false` and
 * `track.getAttribute("onunload") === null`. `hasAttribute` (rather
 * than only `getAttribute(...) === null`) is the canonical primitive
 * for asserting absence of an inline event-handler attribute —
 * `onunload=""` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onunload attribute (W3270)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onunload attribute", () => {
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

    // The pin: NO onunload attribute is authored on the chip strip.
    // A regression that adds `onunload=""`, `onunload="alert('bye')"`,
    // or any other inline unload handler would fail here.
    expect(track!.hasAttribute("onunload")).toBe(false);
    expect(track!.getAttribute("onunload")).toBeNull();
  });
});
