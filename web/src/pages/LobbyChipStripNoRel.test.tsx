import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2882 — the chip-strip inner track (`.lobby-chips`, the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `rel` attribute.
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
 * `rel` is a link-relation attribute — it has defined semantics on
 * `<a>`, `<area>`, `<link>`, and `<form>` elements per HTML Living
 * Standard §4.6.6 (e.g. `noopener`, `noreferrer`, `nofollow`,
 * `prev`, `next`, `stylesheet`). On a generic `<div>` it is not a
 * recognized HTML attribute at all, has no defined behaviour, and
 * is silently ignored by user agents. Authoring `rel` on the chip
 * tablist would therefore be either dead noise or — worse — a
 * misleading hint to readers of the DOM that some link-style
 * relationship is being declared on a non-link element.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its non-ARIA attributes.
 *  - W1330 (LobbyChipStripAria) and W1331
 *    (LobbyChipStripAriaLabelExact) pin `role === "tablist"` and the
 *    `aria-label` text on the inner track — both silent on `rel`.
 *  - The LobbyChipStripNoAria* family (W2754, W2767, W2823, …)
 *    each pin a specific ARIA attribute's absence — none cover the
 *    HTML `rel` attribute.
 *  - W1295 (LobbyChipStripNoAnchor) pins that there is no `<a>`
 *    descendant inside the chip strip, but says nothing about the
 *    `rel` attribute on the strip element itself.
 *  - The LobbyTileAnchorRelAbsent pin covers the tile `<a>` element,
 *    not the chip-strip `<div>`.
 *  - None of the existing pins would catch a regression that added
 *    `rel="noopener"` (or any other `rel` value) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("rel") === false`. `hasAttribute`
 * (rather than `getAttribute(...) === null`) is the canonical
 * primitive for asserting *absence*, and treats the empty-string
 * value `rel=""` as a present-but-empty attribute (which would
 * still be a regression here).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no rel attribute (W2882)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a rel attribute", () => {
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

    // The pin: NO rel attribute is authored on the chip strip.
    // `rel` has no defined semantics on a <div>; a regression that
    // added e.g. `rel="noopener"` would fail here.
    expect(track!.hasAttribute("rel")).toBe(false);
  });
});
