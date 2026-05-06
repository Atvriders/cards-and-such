import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2856 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `popovertarget` attribute.
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
 * `popovertarget` is the HTML standard invoker attribute that turns an
 * element (typically a `<button>`) into a popover trigger: it points
 * (by `id`) at another element bearing the `popover` global attribute,
 * and clicking the invoker toggles, shows, or hides that target popover.
 * Per the WHATWG HTML spec the attribute is only meaningful on
 * `<button>`/`<input type="button|reset|submit|image">` form-associated
 * invoker elements; on a plain `<div role="tablist">` it is meaningless
 * and ignored. Authoring it on the chip-strip track would (1) be
 * semantically wrong (the track is not a button and is not a popover
 * invoker), (2) create a confusing dangling reference to whatever id
 * value was set, and (3) signal to AT users / future maintainers a
 * popover affordance that does not exist.
 *
 * Why this needs its own pin separate from the existing `.lobby-chips`
 * / chip-strip pins:
 *  - The sibling W2848 pin (LobbyChipStripNoPopover) asserts the
 *    HTML `popover` global attribute is absent — that promotes the
 *    element itself into a top-layer popover. `popovertarget` is the
 *    INVERSE side of the popover API (the trigger that points at a
 *    popover by id), and a regression that authored
 *    `popovertarget="some-id"` would not trip the W2848 pin at all.
 *  - W2775 (LobbyChipStripNoAriaHaspopup) pins absence of the ARIA
 *    `aria-haspopup` attribute — purely the a11y popup-affordance
 *    signal, NOT the HTML `popovertarget` invoker attribute.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text — silent on `popovertarget`.
 *  - The drawer-toggle pins (LobbyDrawerToggleNoPopovertarget,
 *    LobbyDrawerToggleNoPopovertargetaction) introspect a different
 *    element entirely (`.lobby-drawer__toggle`, a `<button>`) and pin
 *    the inverse side of that button — they do nothing for the
 *    `.lobby-chips` `<div role="tablist">` track.
 *  - None of the existing pins would catch a regression that added
 *    `popovertarget="<anything>"` to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("popovertarget") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* — any presence at all
 * (even `popovertarget=""`) would register the element as a popover
 * invoker per the spec's IDL reflection rules.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no popovertarget attribute (W2856)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a popovertarget attribute", () => {
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

    // The pin: NO `popovertarget` invoker attribute is authored on the
    // chip strip. A regression that added
    // `popovertarget="some-popover-id"` would falsely register the
    // tablist track as a popover-invoker element pointing at another
    // element by id — semantically wrong on a `<div role="tablist">`
    // (the attribute is only meaningful on form-associated button
    // elements per the HTML spec) and a confusing dangling reference
    // for any AT or future maintainer reading the markup.
    expect(track!.hasAttribute("popovertarget")).toBe(false);
  });
});
