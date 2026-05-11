import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3063 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `vlink` attribute.
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
 * `vlink` is a legacy HTML attribute whose only historical host was
 * the `<body>` element — where it specified the color of "visited"
 * hyperlinks in the document (paired with `link` for unvisited and
 * `alink` for active). It was deprecated in HTML 4.01 in favor of
 * the CSS `:visited` pseudo-class and removed entirely from HTML5.
 * On a `<div role="tablist">` it is meaningless: no user agent, no
 * screen reader, and no modern spec consumer interprets `vlink` on
 * anything other than (legacy) `<body>`. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither the document body nor a hyperlink
 *     styling host, so there is nothing for `vlink` to color.
 *  2. Validators (W3C Nu, html-validate, axe) flag `vlink` on
 *     non-`<body>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `vlink="purple"` (or any color value) would imply the
 *     filter rail somehow styles visited links, confusing tooling
 *     that introspects legacy presentational attributes (e.g.
 *     migration linters that scan for `link`/`vlink`/`alink`/`text`
 *     to flag pre-CSS color authoring).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `vlink`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `vlink`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `vlink`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `vlink` (visited-link color).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy attribute (quote source URL).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `vlink`. A regression that added
 *    `vlink="purple"` (e.g. by mistakenly templating a body-style
 *    color attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("vlink") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `vlink` with an empty value is still authored, and any
 * string value is a regression. We also assert the `getAttribute`
 * shape as a belt-and-braces sanity check.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no vlink attribute (W3063)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a vlink attribute", () => {
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

    // The pin: NO vlink attribute is authored on the chip strip.
    // A regression that adds `vlink=""`, `vlink="purple"`, or any
    // other visited-link color binding would fail here.
    expect(track!.hasAttribute("vlink")).toBe(false);
    expect(track!.getAttribute("vlink")).toBe(null);
  });
});
