import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2887 — the chip-strip inner track (`.lobby-chips`, the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `download` attribute.
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
 * `download` is a hyperlink-only attribute — it has defined semantics
 * exclusively on `<a>` and `<area>` elements per HTML Living
 * Standard §4.6.6, where it instructs the user agent to download the
 * linked resource (optionally renaming it to the attribute's value)
 * rather than navigate to it. On a generic `<div>` the attribute is
 * not a recognized HTML attribute at all, has no defined behaviour,
 * and is silently ignored by user agents. Authoring `download` on the
 * chip tablist would therefore be either dead noise or — worse — a
 * misleading hint to readers of the DOM that some downloadable
 * resource is being declared on a non-link element.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its non-ARIA attributes.
 *  - W1330 (LobbyChipStripAria) and W1331
 *    (LobbyChipStripAriaLabelExact) pin `role === "tablist"` and the
 *    `aria-label` text on the inner track — both silent on `download`.
 *  - The LobbyChipStripNoAria* family (W2754, W2767, W2823, …)
 *    each pin a specific ARIA attribute's absence — none cover the
 *    HTML `download` attribute.
 *  - W1295 (LobbyChipStripNoAnchor) pins that there is no `<a>`
 *    descendant inside the chip strip, but says nothing about the
 *    `download` attribute on the strip element itself.
 *  - W2882 (LobbyChipStripNoRel) pins absence of `rel` on the same
 *    element, but is mute on `download` — the two link-style HTML
 *    attributes are independent regression vectors.
 *  - The LobbyTileAnchorDownloadAbsent pin covers the tile `<a>`
 *    element, not the chip-strip `<div>`.
 *  - None of the existing pins would catch a regression that added
 *    `download` (or `download="filter.json"`, etc.) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("download") === false`. `hasAttribute`
 * (rather than `getAttribute(...) === null`) is the canonical
 * primitive for asserting *absence*, and treats the empty-string
 * value `download=""` as a present-but-empty attribute (which would
 * still be a regression here — the empty form is in fact the most
 * common authoring shape for `download` on `<a>`).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no download attribute (W2887)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a download attribute", () => {
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

    // The pin: NO download attribute is authored on the chip strip.
    // `download` has no defined semantics on a <div>; a regression
    // that added e.g. `download` or `download="filter.json"` would
    // fail here.
    expect(track!.hasAttribute("download")).toBe(false);
  });
});
