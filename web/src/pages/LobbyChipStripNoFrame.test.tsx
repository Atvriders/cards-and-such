import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3013 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `frame` attribute.
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
 * `frame` is a legacy HTML attribute whose only valid host is
 * `<table>` — where it specified which sides of the outer table
 * border were rendered (`void`, `above`, `below`, `hsides`, `lhs`,
 * `rhs`, `vsides`, `box`, `border`). It was deprecated in HTML4 and
 * removed entirely in HTML5. On a `<div role="tablist">` it is
 * meaningless: no user agent, no screen reader, and no spec consumer
 * interprets `frame` on a non-table element. Authoring it on the
 * chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a table, so there is no table border to
 *     control.
 *  2. Validators (W3C Nu, html-validate, axe) flag `frame` on
 *     non-table elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `frame="box"` would imply the filter rail is a table
 *     with a full surrounding border, confusing tooling that
 *     introspects DOM structure (e.g. table-extractors, legacy
 *     HTML4 renderers, semantic markup scanners).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `frame`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `frame`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `frame`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `frame` (table border sides).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `frame`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `frame`. A regression that added
 *    `frame="box"` (e.g. by mistakenly templating a table-style
 *    attribute onto the tablist) would slip past every existing
 *    pin.
 *
 * The pin: `track.hasAttribute("frame") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `frame` with an empty value is still authored, and
 * any string value is a regression. We additionally assert
 * `getAttribute("frame") === null` for belt-and-braces coverage.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no frame attribute (W3013)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a frame attribute", () => {
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

    // The pin: NO frame attribute is authored on the chip strip.
    // A regression that adds `frame=""`, `frame="box"`, or any other
    // table-border-sides binding would fail here.
    expect(track!.hasAttribute("frame")).toBe(false);
    expect(track!.getAttribute("frame")).toBeNull();
  });
});
