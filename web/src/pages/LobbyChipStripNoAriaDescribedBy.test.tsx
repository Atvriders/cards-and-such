import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2773 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-describedby` attribute.
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
 * The chip-strip already announces itself via a self-contained
 * `aria-label="Filter by category"` (pinned by W1330 / W1331). It
 * does NOT delegate any portion of its accessible description to
 * another node in the tree, and it deliberately does not point at
 * any of the surrounding tip / hint / kbd-tip blocks via
 * `aria-describedby`. Adding such a relationship would conflate
 * two independently-rendered widgets:
 *
 *  - the kbd-tip dismissable hint (`.lobby-kbd-tip`, pinned by the
 *    W19xx / W20xx LobbyKbdTip* family) is itself a dismissable
 *    Live/static block whose lifecycle is independent of the chip
 *    strip — wiring it as the chip strip's description would mean
 *    that dismissing the tip would silently strip the chip strip
 *    of its description, and would announce keyboard hints every
 *    time AT focus entered the tablist;
 *  - the visible heading copy ("Browse all games", the H1 pinned
 *    by W*** LobbyH1*) is a page-level landmark heading and not a
 *    description of the filter rail.
 *
 * The chip strip should be self-describing. An `aria-describedby`
 * pointing at any of the above (or a future fragment id we don't
 * yet author) would be a regression — assistive tech would
 * announce the referenced node's flat text every time focus
 * entered the tablist, on top of the existing `aria-label`,
 * producing duplicated and contextually-wrong speech.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `aria-describedby`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — silent on `aria-describedby`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2767
 *    (LobbyChipStripNoAriaBusy), W27xx (LobbyChipStripNoAriaControls
 *    / NoAriaDisabled / NoAriaOrientation) each pin absence of one
 *    other ARIA attribute — none of them check `aria-describedby`.
 *  - W19xx LobbyChipStripNoId / NoStyle / NoTabindex pin absence of
 *    plain HTML attributes, not ARIA description plumbing.
 *  - None of the existing pins would catch a regression that wired
 *    `aria-describedby="lobby-kbd-tip"` (or any other id ref) onto
 *    the inner `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-describedby") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* and matches what
 * accessibility tools actually use to decide whether to walk an
 * id-ref relationship.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-describedby attribute (W2773)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-describedby attribute", () => {
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

    // The pin: NO aria-describedby attribute is authored on the chip
    // strip. A regression that wired the chip strip up to a sibling
    // hint / tip / heading via aria-describedby — duplicating its
    // existing self-contained aria-label and producing extra,
    // contextually-wrong AT speech — would fail here.
    expect(track!.hasAttribute("aria-describedby")).toBe(false);
  });
});
