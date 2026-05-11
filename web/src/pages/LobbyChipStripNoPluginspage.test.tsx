import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3071 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `pluginspage` attribute.
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
 * `pluginspage` is a legacy Netscape-era HTML attribute whose only
 * historical host is `<embed>` — where it carried a URL pointing to
 * a page where the user could download the plugin needed to render
 * the embedded content. On a `<div role="tablist">` it is
 * meaningless: no user agent, no screen reader, and no spec consumer
 * interprets `pluginspage` on a non-`<embed>` element. Authoring it
 * on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not an `<embed>` and references no plugin,
 *     so there is no plugin download page to point at.
 *  2. Validators (W3C Nu, html-validate, axe) flag `pluginspage` on
 *     non-`<embed>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `pluginspage="https://example.com/plugin"` would imply
 *     the filter rail requires a browser plugin, confusing tooling
 *     that introspects DOM provenance (e.g. plugin scanners, legacy
 *     compat analyzers, security policy auditors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `pluginspage`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `pluginspage`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `pluginspage`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `pluginspage` (plugin download URL).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `pluginspage`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `pluginspage`. A regression that added
 *    `pluginspage="https://..."` (e.g. by mistakenly templating an
 *    embed-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("pluginspage") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `pluginspage` with an empty value is still authored,
 * and any string value is a regression. Both checks are asserted
 * for belt-and-suspenders coverage.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no pluginspage attribute (W3071)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a pluginspage attribute", () => {
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

    // The pin: NO pluginspage attribute is authored on the chip strip.
    // A regression that adds `pluginspage=""`,
    // `pluginspage="https://example.com/plugin"`, or any other
    // plugin-download URL binding would fail here.
    expect(track!.hasAttribute("pluginspage")).toBe(false);
    expect(track!.getAttribute("pluginspage")).toBeNull();
  });
});
