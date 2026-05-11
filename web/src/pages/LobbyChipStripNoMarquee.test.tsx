import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3047 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `marquee` attribute.
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
 * `marquee` is not a standard HTML global attribute. The only DOM
 * surface that shares the name is the obsolete `<marquee>` element
 * (a deprecated, non-conforming Internet-Explorer-era scrolling text
 * container). On a `<div role="tablist">` an attribute literally named
 * `marquee` is meaningless: no user agent, no screen reader, and no
 * spec consumer interprets it. Authoring it on the chip strip would
 * be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a `<marquee>` element nor any kind of
 *     animated text scroller; any `marquee="..."` binding is
 *     semantically vacuous.
 *  2. Validators (W3C Nu, html-validate, axe) flag unknown attributes
 *     like `marquee` on a `<div>` as invalid, polluting CI
 *     accessibility reports.
 *  3. A stray `marquee="scroll"` or `marquee="true"` would imply the
 *     filter rail is an obsolete scrolling-marquee surface, confusing
 *     tooling that introspects DOM provenance (e.g. legacy-HTML
 *     migrators, semantic web crawlers, attribute auditors that map
 *     deprecated element names to migration warnings).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `marquee`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `marquee`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `marquee`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `marquee` (obsolete scrolling-marquee surface).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a different
 *    legacy attribute (quote source URL) silent on `marquee`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `marquee`. A regression that added `marquee="scroll"` (e.g. by
 *    mistakenly templating a deprecated element name as a global
 *    attribute onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("marquee") === false` AND
 * `track.getAttribute("marquee") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence — `marquee` with an empty
 * value is still authored, and any string value is a regression. The
 * paired `getAttribute(...) === null` assertion documents the dual
 * surface: an authored empty-string attribute would fail `hasAttribute`
 * but pass a naive truthiness check on `getAttribute`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no marquee attribute (W3047)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a marquee attribute", () => {
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

    // The pin: NO marquee attribute is authored on the chip strip.
    // A regression that adds `marquee=""`, `marquee="scroll"`,
    // `marquee="true"`, or any other obsolete-marquee binding would
    // fail here.
    expect(track!.hasAttribute("marquee")).toBe(false);
    expect(track!.getAttribute("marquee")).toBeNull();
  });
});
