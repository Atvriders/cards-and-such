import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2884 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `target` attribute.
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
 * `target` is the HTML attribute that names a browsing context (e.g.
 * `_blank`, `_self`, `_parent`, `_top`, or a named frame) into which a
 * navigation result is loaded. Per the WHATWG HTML spec it is only
 * meaningful on `<a>`, `<area>`, `<base>`, and `<form>` elements, where
 * it scopes link-following / form-submission to a particular browsing
 * context. On a plain `<div role="tablist">` the attribute is wholly
 * meaningless and ignored — but authoring it would (1) be semantically
 * wrong (the chip-strip track is not a navigable element nor a form),
 * (2) signal to AT users / future maintainers a navigation/context
 * affordance that does not exist, and (3) trip lint rules and confuse
 * any tooling that assumes the presence of `target` implies a link or
 * form-submit action.
 *
 * Why this needs its own pin separate from the existing `.lobby-chips`
 * / chip-strip pins:
 *  - W2856 (LobbyChipStripNoPopovertarget) pins absence of the
 *    `popovertarget` invoker attribute — that is a SEPARATE attribute
 *    (the popover-API trigger that points at a popover by id).
 *    `popovertarget` and `target` are independent attributes; a
 *    regression that authored `target="_blank"` would not trip the
 *    popovertarget pin at all.
 *  - LobbyTileAnchorTargetAbsent (W1871) pins `target` absence on the
 *    tile `<a>` anchors elsewhere in the LobbyPage tree — a completely
 *    different element set (`a.lobby-tile`, NOT the
 *    `<div class="lobby-chips" role="tablist">` chip strip). A
 *    regression that authored `target="_blank"` on the chip strip
 *    would not trip the tile-anchor pin.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text — silent on `target`.
 *  - The LobbyChipStripWrap / LobbyChipStripTag pins assert the tag
 *    name and class membership of the chip strip — silent on `target`.
 *  - None of the existing pins would catch a regression that added
 *    `target="<anything>"` to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("target") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* — any presence at all
 * (even `target=""`) would still register the attribute on the element
 * per the DOM IDL reflection rules.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no target attribute (W2884)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a target attribute", () => {
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

    // The pin: NO `target` browsing-context attribute is authored on
    // the chip strip. A regression that added `target="_blank"` (or
    // any other browsing-context name) would falsely register the
    // tablist track with a navigation-target affordance — semantically
    // wrong on a `<div role="tablist">` (the attribute is only
    // meaningful on `<a>`, `<area>`, `<base>`, and `<form>` per the
    // HTML spec) and confusing for any AT or future maintainer
    // reading the markup.
    expect(track!.hasAttribute("target")).toBe(false);
  });
});
