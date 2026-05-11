import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3081 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `archive` attribute.
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
 * `archive` is not a standard HTML attribute on `<div>` elements. It
 * historically appeared on the deprecated `<applet>` and `<object>`
 * elements as a space-separated list of archive URIs (JAR/CAB bundles)
 * the user agent should preload before running the embedded applet.
 * On a `<div role="tablist">` it is meaningless: no user agent, no
 * screen reader, and no spec consumer interprets `archive` on a
 * non-applet/non-object element. Authoring it on the chip strip would
 * be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it embeds no applet, loads no remote bundle, and has
 *     no archive list to declare.
 *  2. Validators (W3C Nu, html-validate, axe) flag `archive` on
 *     non-applet/non-object elements as an unknown attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `archive="lib.jar"` would imply the filter rail
 *     references a deprecated applet bundle, confusing tooling that
 *     introspects DOM provenance (e.g. legacy applet scanners,
 *     migration linters, deprecated-attribute auditors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `archive`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `archive`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `archive`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `archive` (applet bundle list).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `archive`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `archive`. A regression that added `archive="foo.jar"` (e.g. by
 *    mistakenly templating a legacy applet-style attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("archive") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `archive` with an empty value is still authored, and
 * any string value is a regression. We assert both forms for
 * defense in depth.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no archive attribute (W3081)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an archive attribute", () => {
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

    // The pin: NO archive attribute is authored on the chip strip.
    // A regression that adds `archive=""`, `archive="foo.jar"`, or
    // any other applet-bundle URI list would fail here.
    expect(track!.hasAttribute("archive")).toBe(false);
    expect(track!.getAttribute("archive")).toBeNull();
  });
});
