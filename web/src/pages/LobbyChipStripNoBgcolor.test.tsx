import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3005 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `bgcolor` attribute.
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
 * `bgcolor` is a legacy/presentational HTML attribute whose historic
 * hosts were `<body>`, `<table>`, `<tr>`, `<td>`, `<th>`, and
 * `<marquee>` — used to set a background color via a non-CSS named
 * color or `#RRGGBB` string. It was deprecated in HTML 4.01, removed
 * entirely in HTML5, and is invalid on a `<div role="tablist">`
 * because:
 *  1. The chip strip is a styled flex/scroll container — all visual
 *     presentation (including background) must come from CSS, not
 *     legacy presentational attributes that bypass the cascade.
 *  2. Validators (W3C Nu, html-validate, axe) flag `bgcolor` on any
 *     modern element as an obsolete/invalid attribute, polluting CI
 *     accessibility and HTML-conformance reports.
 *  3. A stray `bgcolor="#fff"` would create a parallel styling channel
 *     outside the design-system tokens (CSS custom properties), making
 *     theme switching (light/dark) and high-contrast modes regress.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `bgcolor`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `bgcolor`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `bgcolor`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `bgcolor` (legacy background color).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a different
 *    legacy attribute (quote source URL) and silent on `bgcolor`.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `bgcolor`. A regression that added
 *    `bgcolor="#000"` (e.g. by porting a legacy table-styled chip
 *    rail) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("bgcolor") === false` AND
 * `track.getAttribute("bgcolor") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence — `bgcolor=""` is still
 * authored — and the `getAttribute === null` check belt-and-braces the
 * absence (no value, not even empty string).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no bgcolor attribute (W3005)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a bgcolor attribute", () => {
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

    // The pin: NO bgcolor attribute is authored on the chip strip.
    // A regression that adds `bgcolor=""`, `bgcolor="#fff"`,
    // `bgcolor="white"`, or any other legacy color binding would fail
    // here.
    expect(track!.hasAttribute("bgcolor")).toBe(false);
    expect(track!.getAttribute("bgcolor")).toBeNull();
  });
});
