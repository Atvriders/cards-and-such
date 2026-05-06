import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2918 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `decoding` attribute.
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
 * `decoding` is an HTML attribute whose only valid host is `<img>`,
 * where it hints to the user agent how the image bitmap should be
 * decoded (`sync`, `async`, or `auto`). On a `<div role="tablist">`
 * it is meaningless: no user agent applies image-decoding semantics
 * to a non-image element. Authoring it on the chip strip would be
 * wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no raster bitmap to decode, so the hint has
 *     no effect.
 *  2. Validators (W3C Nu, html-validate, axe) flag `decoding` on
 *     non-`<img>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `decoding="async"` would mislead tooling that
 *     introspects DOM provenance for image-loading audits (e.g.
 *     LCP analyzers, perf crawlers) into believing the chip strip
 *     is an image element.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `decoding`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `decoding`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `decoding`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `decoding` (image bitmap decoding hint).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `decoding`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `decoding`. A regression that added
 *    `decoding="async"` (e.g. by mistakenly templating an
 *    image-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("decoding") === false` AND
 * `track.getAttribute("decoding") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `decoding` with an empty value is still authored, and
 * any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no decoding attribute (W2918)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a decoding attribute", () => {
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

    // The pin: NO decoding attribute is authored on the chip strip.
    // A regression that adds `decoding=""`, `decoding="async"`,
    // `decoding="sync"`, or `decoding="auto"` would fail here.
    expect(track!.hasAttribute("decoding")).toBe(false);
    expect(track!.getAttribute("decoding")).toBeNull();
  });
});
