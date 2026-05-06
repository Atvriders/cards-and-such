import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2974 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `marginheight` attribute.
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
 * `marginheight` is a deprecated/obsolete HTML presentational attribute
 * whose only ever-valid hosts were `<body>`, `<frame>`, and `<iframe>`
 * — where it specified the top/bottom margin in pixels around the
 * frame/document content. It was removed from HTML5 in favor of CSS
 * `margin-top` / `margin-bottom`. On a `<div role="tablist">` it is
 * meaningless: no modern user agent honors it, and no spec consumer
 * interprets `marginheight` on a non-frame/non-body element. Authoring
 * it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a frame nor the document body, so there
 *     is no frame margin semantic to express.
 *  2. Validators (W3C Nu, html-validate, axe) flag `marginheight` on
 *     non-frame/non-body elements as an unknown/obsolete attribute,
 *     polluting CI accessibility and HTML conformance reports.
 *  3. A stray `marginheight="0"` would imply the chip strip is a
 *     frame container with frame chrome semantics, confusing tooling
 *     that introspects the DOM for frame-set/iframe layout
 *     (e.g. legacy frame-aware crawlers, accessibility frame checkers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `marginheight`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `marginheight`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `marginheight`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `marginheight` (frame margin pixel size).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `marginheight`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `marginheight`. A regression that added
 *    `marginheight="0"` (e.g. by mistakenly templating a frame-style
 *    attribute onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("marginheight") === false` and
 * `track.getAttribute("marginheight") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `marginheight` with an empty value is still authored,
 * and any string value is a regression. We pin both forms to defend
 * against either-direction regressions.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no marginheight attribute (W2974)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a marginheight attribute", () => {
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

    // The pin: NO marginheight attribute is authored on the chip strip.
    // A regression that adds `marginheight="0"`, `marginheight="10"`,
    // or any other frame-margin pixel binding would fail here.
    expect(track!.hasAttribute("marginheight")).toBe(false);
    expect(track!.getAttribute("marginheight")).toBeNull();
  });
});
