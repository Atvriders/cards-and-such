import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3072 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `hspace` attribute.
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
 * `hspace` is an obsolete HTML attribute (HTML 4 era) whose only valid
 * historical hosts were `<img>`, `<object>`, `<applet>`, `<marquee>`,
 * and `<iframe>` — where it specified the horizontal whitespace (in
 * pixels) around the embedded media. It was removed entirely in HTML5
 * in favour of CSS `margin-left` / `margin-right`. On a
 * `<div role="tablist">` it is doubly meaningless: not only is the host
 * element wrong (a div is not an embedded media object), but the
 * attribute itself is no longer part of the HTML specification at all.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — there is no embedded media payload that would have
 *     surrounding whitespace to control.
 *  2. Validators (W3C Nu, html-validate, axe) flag `hspace` as an
 *     obsolete attribute on every element, polluting CI accessibility
 *     and lint reports.
 *  3. Horizontal spacing for the chip strip is controlled by CSS
 *     (gap / padding on `.lobby-chips`) — an inline `hspace="8"` would
 *     fight the stylesheet and either be ignored entirely (modern
 *     browsers) or produce inconsistent layout in legacy engines.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `hspace`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `hspace`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `hspace`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `hspace` (horizontal whitespace around embedded media).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a quote
 *    source URL attribute, orthogonal to `hspace`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `hspace`. A regression that added `hspace="8"` (e.g. by
 *    mistakenly templating an `<img>`-style spacing attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("hspace") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `hspace` with an empty value is still authored, and any
 * string value is a regression. We additionally assert
 * `getAttribute("hspace") === null` as a belt-and-braces check that
 * the attribute is genuinely unset rather than holding an empty value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no hspace attribute (W3072)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an hspace attribute", () => {
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

    // The pin: NO hspace attribute is authored on the chip strip.
    // A regression that adds `hspace=""`, `hspace="8"`, or any other
    // obsolete media-spacing value would fail here.
    expect(track!.hasAttribute("hspace")).toBe(false);
    expect(track!.getAttribute("hspace")).toBeNull();
  });
});
