import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3103 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `high` attribute.
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
 * `high` is a legacy HTML attribute whose only valid host is
 * `<meter>` — where it carries the numeric lower bound of the "high"
 * range of the gauge. On a `<div role="tablist">` it is meaningless:
 * no user agent, no screen reader, and no spec consumer interprets
 * `high` on a non-meter element. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a meter gauge nor a numeric range
 *     display, so there is no "high" threshold to set.
 *  2. Validators (W3C Nu, html-validate, axe) flag `high` on
 *     non-meter elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `high="0.8"` would imply the filter rail is a numeric
 *     gauge with a high-range threshold, confusing tooling that
 *     introspects DOM semantics (e.g. form inspectors, semantic web
 *     crawlers, automated metrics scrapers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `high`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `high`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `high`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `high` (meter high threshold).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `high`. A regression that added `high="0.8"`
 *    (e.g. by mistakenly templating a meter-style attribute onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("high") === false` AND
 * `track.getAttribute("high") === null`.
 * `hasAttribute` (rather than `getAttribute(...) === null` alone)
 * is the canonical primitive for asserting absence of a legacy HTML
 * attribute — `high` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no high attribute (W3103)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a high attribute", () => {
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

    // The pin: NO high attribute is authored on the chip strip.
    // A regression that adds `high=""`, `high="0.8"`, or any other
    // meter-threshold numeric binding would fail here.
    expect(track!.hasAttribute("high")).toBe(false);
    expect(track!.getAttribute("high")).toBeNull();
  });
});
