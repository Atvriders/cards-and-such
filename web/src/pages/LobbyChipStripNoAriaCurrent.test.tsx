import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2779 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-current` attribute.
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
 * `aria-current` is meaningful on the *items* within a navigation
 * or tablist (e.g. the currently selected tab/page), not on the
 * container itself. WAI-ARIA defines `aria-current` as a property
 * indicating the current item within a *set* — placing it on the
 * tablist parent has no defined semantics and would confuse
 * assistive technology, which expects to find `aria-current` on a
 * specific child anchor/button rather than on the rail wrapping
 * them all.
 *
 * Note that `aria-current` IS legitimately used elsewhere in the
 * lobby — the drawer navigation links carry `aria-current="page"`
 * to indicate the active route, as documented by the sibling pin
 * LobbyDrawerLinkAriaCurrent. That makes it particularly important
 * to pin its ABSENCE on the chip strip container: a future
 * refactor that generalised "active" indication from the per-link
 * level up to a parent container could plausibly sprinkle
 * `aria-current` onto the chip rail too, with no other test
 * failing.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-current`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-current`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-current` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on the same element — orthogonal to
 *    `aria-current`.
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy`
 *    on the same element — orthogonal to `aria-current`.
 *  - None of the existing pins would catch a regression that added
 *    `aria-current="page"` (or `="true"`/`="location"`/etc.) to the
 *    inner `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-current") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether to fall back to the role's default current-item
 * semantics.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-current attribute (W2779)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-current attribute", () => {
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

    // The pin: NO aria-current attribute is authored on the chip strip.
    // A regression that adds `aria-current="page"` (incorrectly
    // marking the entire rail as the active navigation target) or any
    // other aria-current value (e.g. "true", "location", "step") on
    // the container — instead of on a specific child chip — would
    // fail here.
    expect(track!.hasAttribute("aria-current")).toBe(false);
  });
});
