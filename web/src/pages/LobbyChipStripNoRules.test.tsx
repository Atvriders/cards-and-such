import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3015 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `rules` attribute.
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
 * `rules` is a legacy HTML attribute whose only valid host is the
 * `<table>` element — where it specifies which interior borders
 * (`none`, `groups`, `rows`, `cols`, `all`) the table should render
 * between cells. On a `<div role="tablist">` it is meaningless: no
 * user agent renders table interior borders on a non-table element,
 * and the attribute has been obsolete in HTML5 in favor of CSS for
 * over a decade. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a `<table>`, has no rows or columns, and
 *     has no interior borders for `rules` to control.
 *  2. Validators (W3C Nu, html-validate, axe) flag `rules` on
 *     non-table elements as an unknown/obsolete attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `rules="all"` would imply the filter rail is a tabular
 *     data grid, confusing screen readers and tooling that introspect
 *     DOM structure for table semantics.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `rules`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `rules`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `rules`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `rules` (table border control).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `rules`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `rules`. A regression that added `rules="all"` (e.g. by
 *    mistakenly templating a table-style attribute onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("rules") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `rules` with an empty value is still authored, and any
 * string value is a regression. We assert BOTH forms here to lock
 * down the absence comprehensively.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no rules attribute (W3015)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a rules attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO rules attribute is authored on the chip strip.
    // A regression that adds `rules=""`, `rules="all"`, `rules="rows"`,
    // or any other table-border binding would fail here.
    expect(track!.hasAttribute("rules")).toBe(false);
    expect(track!.getAttribute("rules")).toBeNull();
  });
});
