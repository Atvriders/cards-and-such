import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2848 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `popover` attribute.
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
 * `popover` is the HTML standard global attribute that opts an element
 * into the top-layer popover API (values `"auto"`, `"manual"`, or the
 * empty string). When set, the browser hides the element by default,
 * promotes it to the top layer when shown via `.showPopover()` /
 * `popovertarget`, and applies special focus + light-dismiss semantics.
 *
 * The chip-strip tablist is NOT a popover: it is an always-visible,
 * inline filter rail rendered directly in document flow. Authoring
 * `popover="auto"` (or `"manual"`, or the empty string which the spec
 * coerces to `"auto"`) would cause the entire chip strip to vanish on
 * page load — `display: none` is the User Agent default for closed
 * popovers — and would never be reopened, since nothing in the lobby
 * calls `showPopover()` on this element or targets it via
 * `popovertarget`. The whole category filter rail would silently
 * disappear from every viewport.
 *
 * Why this needs its own pin separate from the existing `.lobby-chips`
 * / chip-strip pins:
 *  - The sibling W2775 pin (LobbyChipStripNoAriaHaspopup) asserts the
 *    ARIA `aria-haspopup` attribute is absent — that is purely the
 *    a11y popup-affordance signal, NOT the HTML `popover` global
 *    attribute that promotes an element into the top-layer popover API.
 *    A regression that authored `popover="auto"` would not trip the
 *    `aria-haspopup` pin at all.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text — silent on `popover`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact `aria-label`
 *    string — silent on `popover`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal.
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy` —
 *    orthogonal.
 *  - The drawer-toggle pins (LobbyDrawerToggleNoPopovertarget,
 *    LobbyDrawerToggleNoPopovertargetaction) introspect a different
 *    element entirely (`.lobby-drawer__toggle`) and pin the inverse
 *    side of the API (the trigger attributes that target a popover),
 *    not the `popover` global attribute on the chip-strip itself.
 *  - None of the existing pins would catch a regression that added
 *    `popover="auto"`, `popover="manual"`, or `popover=""` to the
 *    inner `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("popover") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * detection path the User Agent itself uses to decide whether to apply
 * popover semantics — any presence at all (even `popover=""`, which
 * the spec normalizes to `"auto"`) flips the element into the
 * top-layer hidden-by-default state.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no popover attribute (W2848)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a popover attribute", () => {
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

    // The pin: NO `popover` global attribute is authored on the chip
    // strip. A regression that added `popover="auto"` (or `"manual"`,
    // or `""`) would promote the entire filter rail into a top-layer
    // popover and hide it from the page until `.showPopover()` is
    // called — which nothing in the lobby ever does. This assertion
    // catches that whole-rail-vanishes class of regression at the
    // attribute level, before any layout/visibility check could even
    // surface the symptom.
    expect(track!.hasAttribute("popover")).toBe(false);
  });
});
