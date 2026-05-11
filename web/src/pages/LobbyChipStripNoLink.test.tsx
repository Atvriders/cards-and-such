import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3065 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `link` attribute.
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
 * `link` is a legacy HTML attribute that historically appeared on the
 * `<body>` element to set the default color of unvisited hyperlinks
 * (alongside `vlink` and `alink`). It is obsolete in modern HTML and
 * has no meaning on a `<div role="tablist">`: no user agent applies
 * link-color styling from a `link` attribute on a non-body element,
 * and no spec consumer interprets it. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body and has no concept of a
 *     "default unvisited link color" to broadcast.
 *  2. Validators (W3C Nu, html-validate, axe) flag `link` on
 *     non-body elements as an unknown/invalid attribute, polluting CI
 *     accessibility reports.
 *  3. A stray `link="#0000ff"` would imply the filter rail is acting
 *     as a body-level link-coloring host, confusing tooling that
 *     introspects DOM provenance (e.g. legacy-attribute auditors,
 *     accessibility color-contrast scanners).
 *
 * Note: this pin targets the bare `link` body-coloring attribute
 * (HTML 3.2 / 4.01 transitional `<body link="...">`), NOT the
 * `rel="..."` link-relation attribute on `<link>` / `<a>` elements.
 * Those are separate concerns covered by their own pins (NoRel).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `link`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `link`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `link`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `link` (body-level link color).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `link`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `link` (the body-coloring attribute). A
 *    regression that added `link="#0000ff"` (e.g. by mistakenly
 *    templating a body-style attribute onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("link") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `link` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no link attribute (W3065)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a link attribute", () => {
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

    // The pin: NO link attribute is authored on the chip strip.
    // A regression that adds `link=""`, `link="#0000ff"`, or any
    // other body-level link-color binding would fail here.
    expect(track!.hasAttribute("link")).toBe(false);
    expect(track!.getAttribute("link")).toBeNull();
  });
});
