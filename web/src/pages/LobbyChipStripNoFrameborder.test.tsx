import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2972 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `frameborder` attribute.
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
 * `frameborder` is a deprecated, presentational HTML attribute whose
 * only historical hosts are `<frame>`, `<frameset>`, and `<iframe>` —
 * where it took values "0" or "1" to control the chrome border drawn
 * around the embedded browsing context. It has been removed from the
 * HTML Living Standard (replaced by CSS `border` on `<iframe>`) and
 * never had any meaning on a `<div role="tablist">`. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not an embedded browsing context, so there is
 *     no frame chrome to suppress or draw.
 *  2. Validators (W3C Nu, html-validate, axe) flag `frameborder` on
 *     non-frame elements as an obsolete/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `frameborder="0"` would imply the filter rail is a
 *     frame-like embedding boundary, confusing tooling that
 *     introspects DOM provenance (e.g. legacy frame-sniffing crawlers,
 *     accessibility scanners that special-case frame chrome).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `frameborder`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `frameborder`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `frameborder`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `frameborder` (frame chrome control).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `frameborder`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `frameborder`. A regression that added
 *    `frameborder="0"` (e.g. by mistakenly templating an iframe-style
 *    attribute onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("frameborder") === false` AND
 * `track.getAttribute("frameborder") === null`. `hasAttribute`
 * (rather than only `getAttribute(...) === null`) is the canonical
 * primitive for asserting absence of a legacy HTML attribute —
 * `frameborder` with an empty value is still authored, and any
 * string value (including "0") is a regression. The companion
 * `getAttribute(...) === null` check belt-and-braces the absence
 * across both DOM accessor surfaces.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no frameborder attribute (W2972)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a frameborder attribute", () => {
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

    // The pin: NO frameborder attribute is authored on the chip
    // strip. A regression that adds `frameborder=""`, `frameborder="0"`,
    // `frameborder="1"`, or any other frame-chrome binding would fail
    // here.
    expect(track!.hasAttribute("frameborder")).toBe(false);
    expect(track!.getAttribute("frameborder")).toBeNull();
  });
});
