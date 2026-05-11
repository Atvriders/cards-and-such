import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3121 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onload` attribute.
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
 * `onload` is a legacy inline-event-handler HTML attribute whose only
 * valid hosts are elements that emit a `load` event — `<body>`,
 * `<img>`, `<iframe>`, `<link>`, `<script>`, `<style>`, `<object>`,
 * `<embed>`, etc. On a `<div role="tablist">` it is meaningless: a
 * plain `<div>` never fires a `load` event, so any handler bound via
 * `onload="..."` would simply never run. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a resource-loading element, so there is no
 *     `load` event to handle.
 *  2. Inline event-handler attributes are a long-standing CSP /
 *     security smell — every `onload="..."` is an inline-script
 *     execution point that violates strict CSP `script-src` policies
 *     and is flagged by XSS auditors as a sink for attribute-injection
 *     attacks. Pinning its absence guards against accidental
 *     reintroduction of inline JS on the chip strip.
 *  3. Validators (W3C Nu, html-validate, axe) and linters
 *     (eslint-plugin-react, no-inline-handlers) flag `onload` on
 *     non-loading elements as an unknown/invalid attribute, polluting
 *     CI accessibility and security reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onload`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onload`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `onload`.
 *  - W2894 (LobbyChipStripNoCoords) and W2903 (LobbyChipStripNoCite)
 *    pin absence of `coords` and `cite` respectively — different
 *    legacy attributes, silent on `onload`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `onload`. A regression that added `onload="alert(1)"` (e.g. via
 *    an XSS-style attribute injection or a copy-paste from a
 *    `<body onload="...">` template) would slip past every existing
 *    pin.
 *
 * The pin: `track.hasAttribute("onload") === false` AND
 * `track.getAttribute("onload") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an inline-handler
 * attribute — `onload` with an empty value is still authored, and any
 * string value (handler body) is a regression. The `getAttribute(...)
 * === null` companion check fortifies against a future DOM polyfill
 * that diverges between the two primitives.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onload attribute (W3121)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onload attribute", () => {
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

    // The pin: NO onload attribute is authored on the chip strip.
    // A regression that adds `onload=""`, `onload="alert(1)"`, or any
    // other inline-handler string would fail here.
    expect(track!.hasAttribute("onload")).toBe(false);
    expect(track!.getAttribute("onload")).toBeNull();
  });
});
