import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2900 — the chip-strip inner track (`.lobby-chips`, the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `src` attribute.
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
 * `src` is a resource-reference attribute — it has defined semantics
 * on `<img>`, `<iframe>`, `<video>`, `<audio>`, `<source>`, `<embed>`,
 * `<input type="image">`, `<script>`, and `<track>` per HTML Living
 * Standard §4.8 / §4.10 / §4.12. On a generic `<div>` it is not a
 * recognized HTML attribute at all, has no defined behaviour, and is
 * silently ignored by user agents (no resource fetch, no media
 * element exposure to AT). Authoring `src` on the chip tablist would
 * be either dead noise or — worse — a misleading hint to readers of
 * the DOM that the tablist is somehow embedding a remote resource,
 * while the browser would still expose it as a plain tablist with
 * zero fetch affordance. A drive-by refactor that mistakenly typed
 * `src="..."` instead of e.g. `data-src="..."` (a perfectly valid
 * `data-*` attribute) would silently introduce a non-conformant
 * attribute on the chip strip.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its non-ARIA attributes.
 *  - W1330 (LobbyChipStripAria) and W1331
 *    (LobbyChipStripAriaLabelExact) pin `role === "tablist"` and the
 *    `aria-label` text on the inner track — both silent on `src`.
 *  - The LobbyChipStripNoAria* family each pin a specific ARIA
 *    attribute's absence — none cover the HTML `src` attribute.
 *  - W2889 (LobbyChipStripNoHref) pins absence of `href`, a sibling
 *    resource/link reference attribute, but does not cover `src`.
 *  - W2882 (LobbyChipStripNoRel) pins absence of `rel`, a sibling
 *    link-relation attribute, but does not cover `src`.
 *  - W2112 (LobbyChipStripNoStyle), LobbyChipStripNoId,
 *    LobbyChipStripNoName, LobbyChipStripNoTabindex, etc. each cover
 *    a different generic-HTML attribute's absence; none cover `src`.
 *  - None of the existing pins would catch a regression that added
 *    `src="..."` (or any other `src` value) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("src") === false`. `hasAttribute`
 * (rather than `getAttribute(...) === null`) is the canonical
 * primitive for asserting *absence*, and treats the empty-string
 * value `src=""` as a present-but-empty attribute (which would still
 * be a regression here — `src=""` triggers a fetch of the current
 * document URL on real resource elements and is pure noise on a
 * `<div>`).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no src attribute (W2900)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a src attribute", () => {
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

    // The pin: NO src attribute is authored on the chip strip.
    // `src` has no defined semantics on a <div>; a regression that
    // added e.g. `src="/foo.png"` would fail here.
    expect(track!.hasAttribute("src")).toBe(false);
  });
});
