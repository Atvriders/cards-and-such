import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2889 — the chip-strip inner track (`.lobby-chips`, the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `href` attribute.
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
 * `href` is a hyperlink-reference attribute — it has defined
 * semantics on `<a>`, `<area>`, `<base>`, and `<link>` elements per
 * HTML Living Standard §4.6 and §4.2. On a generic `<div>` it is
 * not a recognized HTML attribute at all, has no defined behaviour,
 * and is silently ignored by user agents (no navigation, no link
 * exposure to AT). Authoring `href` on the chip tablist would be
 * either dead noise or — worse — a misleading hint to readers of the
 * DOM that the tablist is somehow link-like, while assistive
 * technology would still expose it as a tablist with zero navigation
 * affordance.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its non-ARIA attributes.
 *  - W1330 (LobbyChipStripAria) and W1331
 *    (LobbyChipStripAriaLabelExact) pin `role === "tablist"` and the
 *    `aria-label` text on the inner track — both silent on `href`.
 *  - The LobbyChipStripNoAria* family each pin a specific ARIA
 *    attribute's absence — none cover the HTML `href` attribute.
 *  - W1295 (LobbyChipStripNoAnchor) pins that there is no `<a>`
 *    descendant inside the chip strip, but says nothing about an
 *    `href` attribute on the strip element itself (a `<div href="...">`
 *    is structurally distinct from a descendant `<a>`).
 *  - W2882 (LobbyChipStripNoRel) pins absence of `rel`, a sibling
 *    link-relation attribute, but does not cover `href`.
 *  - The LobbyTileAnchor* pins (e.g. LobbyTileAnchorTag) cover the
 *    tile `<a>` element — those expect `href` to be PRESENT on the
 *    tile. They are silent on the chip-strip `<div>`.
 *  - None of the existing pins would catch a regression that added
 *    `href="#"` (or any other `href` value) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("href") === false`. `hasAttribute`
 * (rather than `getAttribute(...) === null`) is the canonical
 * primitive for asserting *absence*, and treats the empty-string
 * value `href=""` as a present-but-empty attribute (which would
 * still be a regression here — `href=""` is a same-document link
 * on real link elements and pure noise on a `<div>`).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no href attribute (W2889)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an href attribute", () => {
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

    // The pin: NO href attribute is authored on the chip strip.
    // `href` has no defined semantics on a <div>; a regression that
    // added e.g. `href="#"` would fail here.
    expect(track!.hasAttribute("href")).toBe(false);
  });
});
