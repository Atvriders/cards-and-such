import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3050 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `truespeed` attribute.
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
 * `truespeed` is a legacy boolean HTML attribute whose only valid host
 * is `<marquee>` — where (when present) it instructs the user agent to
 * honour `scrolldelay` values below 60ms rather than clamping them. On
 * a `<div role="tablist">` it is meaningless: no user agent, no screen
 * reader, and no spec consumer interprets `truespeed` on a non-marquee
 * element. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a marquee, so there is no scroll-delay
 *     timing for `truespeed` to govern.
 *  2. Validators (W3C Nu, html-validate, axe) flag `truespeed` on
 *     non-marquee elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `truespeed` would imply the filter rail is a marquee
 *     ticker, confusing tooling that introspects DOM provenance and
 *     legacy-element heuristics.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `truespeed`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `truespeed`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `truespeed`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL).
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `truespeed`. A regression that added `truespeed` (e.g. by
 *    mistakenly templating a marquee-style attribute onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("truespeed") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `truespeed` is a boolean attribute, and its mere
 * presence (even with empty value) is a regression. We also pin
 * `getAttribute("truespeed") === null` as a belt-and-braces check.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no truespeed attribute (W3050)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a truespeed attribute", () => {
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

    // The pin: NO truespeed attribute is authored on the chip strip.
    // A regression that adds `truespeed`, `truespeed=""`, or
    // `truespeed="true"` would fail here.
    expect(track!.hasAttribute("truespeed")).toBe(false);
    expect(track!.getAttribute("truespeed")).toBeNull();
  });
});
