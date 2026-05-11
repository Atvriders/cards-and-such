import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3102 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `low` attribute.
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
 * `low` is an HTML attribute whose only valid host is the `<meter>`
 * element — where it marks the upper bound of the "low" range of a
 * gauge value. On a `<div role="tablist">` it is meaningless: no user
 * agent and no assistive technology interprets `low` on a non-meter
 * element. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a meter/gauge, so there is no value range
 *     to bracket.
 *  2. Validators (W3C Nu, html-validate, axe) flag `low` on
 *     non-`<meter>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `low="0.3"` would imply the filter rail exposes a
 *     numeric range threshold, confusing tooling that introspects DOM
 *     semantics (e.g. accessibility tree walkers, meter scrapers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `low`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `low`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `low`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `low` (meter low-range bound).
 *  - Sibling pins for `<meter>`-adjacent attributes (NoMin, NoMax,
 *    NoValue) each guard one specific bound; none of them cover
 *    `low`. A regression that added `low="0.3"` (e.g. by mistakenly
 *    templating a meter-style attribute onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("low") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `low` with an empty value is still authored, and any
 * string value is a regression. We also assert `getAttribute("low")
 * === null` as a belt-and-braces check.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no low attribute (W3102)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a low attribute", () => {
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

    // The pin: NO low attribute is authored on the chip strip.
    // A regression that adds `low=""`, `low="0.3"`, or any other
    // meter-range bound binding would fail here.
    expect(track!.hasAttribute("low")).toBe(false);
    expect(track!.getAttribute("low")).toBeNull();
  });
});
