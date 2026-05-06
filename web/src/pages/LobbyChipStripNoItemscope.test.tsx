import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2864 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `itemscope` attribute.
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
 * `itemscope` is a microdata-vocabulary boundary marker (HTML Living
 * Standard §5.5 "Microdata"). Authoring `itemscope` on an element
 * declares that the element (and its descendants) form a microdata
 * "item" — a block of typed name/value pairs intended to be extracted
 * by structured-data crawlers (Google, schema.org consumers, etc.).
 * In well-formed microdata an `itemscope` is normally accompanied by
 * an `itemtype` URL and one or more descendant `itemprop` declarations.
 *
 * The chip-strip tablist is not, and is not intended to be, a
 * microdata item:
 *  - It carries no `itemtype`, no `itemid`, and no `itemprop`
 *    descendants — the rail is presentational filter UI, not a
 *    structured-data payload.
 *  - Its semantics are conveyed exclusively through ARIA
 *    (`role="tablist"`, `aria-label="Filter by category"`), which is
 *    the appropriate vocabulary for interactive widget structure.
 *  - Adding a stray `itemscope` to a tablist would create an empty
 *    microdata item with no type and no properties — a meaningless
 *    artefact that crawlers may either ignore or report as malformed
 *    structured data, and that has no effect on assistive tech but
 *    does pollute the DOM-attribute surface area.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its microdata attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `itemscope`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `itemscope`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — orthogonal to the inner track's microdata
 *    state.
 *  - The LobbyChipStripNoAria* family (W2754 NoAriaMultiselectable,
 *    W2767 NoAriaBusy, W2823 NoAriaAtomic, etc.) each pin a DIFFERENT
 *    specific ARIA attribute's absence — none cover microdata
 *    attributes such as `itemscope`.
 *  - None of the existing pins would catch a regression that added
 *    `itemscope` (with or without an accompanying `itemtype`) to the
 *    inner `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("itemscope") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and is the accessor
 * microdata extractors use to decide whether to begin a new item
 * scope at this node.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other attribute of the element under test.
 */
describe("LobbyPage — .lobby-chips tablist has no itemscope attribute (W2864)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an itemscope attribute", () => {
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

    // The pin: NO itemscope attribute is authored on the chip strip.
    // A regression that adds `itemscope` (declaring the rail to be a
    // microdata item, with or without a meaningful `itemtype`) would
    // fail here.
    expect(track!.hasAttribute("itemscope")).toBe(false);
  });
});
