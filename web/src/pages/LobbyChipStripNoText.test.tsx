import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3069 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `text` attribute.
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
 * `text` is a legacy HTML attribute whose only valid host is
 * `<body>` — where it carried the default text color for the document
 * (e.g. `<body text="#000000">`). It was deprecated in HTML 4.01 in
 * favor of CSS `color`, and removed entirely in HTML5. On a
 * `<div role="tablist">` it is meaningless: no user agent applies
 * `text` as a foreground-color binding outside `<body>`, and no
 * accessibility tooling treats it as anything but a stray unknown
 * attribute. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — its text color is governed by CSS (`.lobby-chips` rules
 *     in the stylesheet), not by a presentational HTML attribute.
 *  2. Validators (W3C Nu, html-validate, axe) flag `text` on
 *     non-`<body>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `text="#fff"` would imply a presentational override
 *     bypassing the design-token / CSS-variable pipeline, breaking
 *     theming (light/dark) and confusing tooling that introspects
 *     DOM color provenance.
 *
 * Note: this pin is about the bare HTML attribute named `text`, NOT
 * about `textContent` (the DOM property that exposes a node's text
 * children). `textContent` is an IDL property, never an authored
 * attribute, and is not affected by `hasAttribute("text")`.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `text`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `text`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `text`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `text` (legacy body text-color).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `text`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `text`. A regression that added `text="#fff"` (e.g. by mistakenly
 *    templating a `<body>`-style presentational color attribute onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("text") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `text` with an empty value is still authored, and any
 * string value is a regression. We assert both forms for redundancy.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no text attribute (W3069)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a text attribute", () => {
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

    // The pin: NO `text` attribute is authored on the chip strip.
    // A regression that adds `text=""`, `text="#fff"`, or any other
    // legacy body-text-color binding would fail here.
    expect(track!.hasAttribute("text")).toBe(false);
    expect(track!.getAttribute("text")).toBeNull();
  });
});
