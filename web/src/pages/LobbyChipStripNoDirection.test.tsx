import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3057 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `direction` attribute.
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
 * `direction` is a legacy HTML attribute whose only valid host is
 * the obsolete `<marquee>` element — where it carried a scroll
 * direction value (`left`, `right`, `up`, `down`). On a
 * `<div role="tablist">` it is meaningless: no user agent, no screen
 * reader, and no spec consumer interprets `direction` on a
 * non-marquee element. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a marquee, so there is no scroll axis
 *     binding for `direction` to control.
 *  2. Validators (W3C Nu, html-validate, axe) flag `direction` on
 *     non-marquee elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `direction="left"` would imply the filter rail is a
 *     marquee scrolling sideways, confusing legacy IE/Edge-style
 *     compatibility shims and any tooling that introspects DOM
 *     marquee semantics.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `direction`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `direction`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `direction` (marquee scroll axis).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `direction`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `direction`. A regression that added
 *    `direction="left"` (e.g. by mistakenly templating a
 *    marquee-style attribute onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("direction") === false` and
 * `track.getAttribute("direction") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `direction` with an empty value is still authored,
 * and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no direction attribute (W3057)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a direction attribute", () => {
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

    // The pin: NO direction attribute is authored on the chip strip.
    // A regression that adds `direction=""`, `direction="left"`,
    // `direction="right"`, or any other marquee-style scroll axis
    // binding would fail here.
    expect(track!.hasAttribute("direction")).toBe(false);
    expect(track!.getAttribute("direction")).toBeNull();
  });
});
