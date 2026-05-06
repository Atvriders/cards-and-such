import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2840 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `hidden` attribute.
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
 * The category filter strip is the user's primary discoverability
 * affordance for narrowing the lobby grid: it must be visible and
 * interactive on every render path. The HTML `hidden` attribute
 * (boolean) would remove the element from the accessibility tree
 * AND from layout — equivalent to `display: none` semantically. A
 * stray `hidden` on the chip strip would silently strip the entire
 * filter UI from the page with no other test failing, since the
 * children would still mount but be invisible to both users and
 * assistive tech.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its `hidden` state.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    presentation/visibility attributes like `hidden`.
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy`
 *    on the same element — orthogonal to the boolean `hidden`
 *    attribute.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — also orthogonal to `hidden`.
 *  - The various `LobbyChipStripNo*` sibling pins each cover one
 *    specific attribute (autofocus, contenteditable, dir, form,
 *    id, inputmode, lang, name, spellcheck, style, tabindex,
 *    translate, value) — none of them assert `hidden` absence.
 *  - None of the existing pins would catch a regression that added
 *    `hidden` (or `hidden=""`) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("hidden") === false`.
 * `hasAttribute` (rather than checking the IDL `hidden` property)
 * is the canonical primitive for asserting absence of the AUTHORED
 * attribute — the boolean reflection on `.hidden` would also be
 * `false` if the element merely lacked the attribute, which is the
 * exact state we want to pin.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no hidden attribute (W2840)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a hidden attribute", () => {
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

    // The pin: NO hidden attribute is authored on the chip strip.
    // A regression that adds `hidden` (boolean) or `hidden=""` —
    // either of which would remove the entire filter rail from
    // layout AND the accessibility tree — would fail here.
    expect(track!.hasAttribute("hidden")).toBe(false);
  });
});
