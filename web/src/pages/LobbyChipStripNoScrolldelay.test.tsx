import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3059 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `scrolldelay` attribute.
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
 * `scrolldelay` is a legacy HTML attribute whose only valid host was
 * the deprecated `<marquee>` element — where it specified the number
 * of milliseconds between each successive scrolling step of the
 * marquee text. On a `<div role="tablist">` it is meaningless: no
 * user agent, no screen reader, and no spec consumer interprets
 * `scrolldelay` on a non-marquee element. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a marquee, so there is no scrolling step
 *     timing to control.
 *  2. Validators (W3C Nu, html-validate, axe) flag `scrolldelay` on
 *     non-marquee elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `scrolldelay="100"` would imply the filter rail is a
 *     marquee, confusing tooling that introspects DOM provenance
 *     (e.g. legacy-marquee detectors, semantic crawlers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `scrolldelay`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `scrolldelay`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `scrolldelay`. A regression that added `scrolldelay="100"` (e.g.
 *    by mistakenly templating a marquee-style attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("scrolldelay") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `scrolldelay` with an empty value is still authored,
 * and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no scrolldelay attribute (W3059)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a scrolldelay attribute", () => {
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

    // The pin: NO scrolldelay attribute is authored on the chip strip.
    // A regression that adds `scrolldelay=""`, `scrolldelay="100"`,
    // or any other marquee-style timing binding would fail here.
    expect(track!.hasAttribute("scrolldelay")).toBe(false);
    expect(track!.getAttribute("scrolldelay")).toBeNull();
  });
});
