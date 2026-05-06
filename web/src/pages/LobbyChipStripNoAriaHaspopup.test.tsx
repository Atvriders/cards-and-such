import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2775 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-haspopup` attribute.
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
 * `aria-haspopup` is the WAI-ARIA signal that activating an element
 * will reveal a popup (menu, listbox, tree, grid, or dialog). The
 * chip-strip tablist does NOT pop anything up: it is a flat,
 * always-visible row of toggle chips. Each chip directly mutates the
 * active category filter in place — there is no menu, no overlay,
 * no disclosure surface that appears on activation. Authoring
 * `aria-haspopup` on the rail (or worse, `aria-haspopup="menu"`)
 * would mislead assistive tech into announcing a popup affordance
 * that the user can never trigger and that never exists in the DOM.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-haspopup`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-haspopup`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-haspopup` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on the same element — orthogonal to
 *    `aria-haspopup`.
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy`
 *    on the same element — also orthogonal.
 *  - The sibling per-chip pins (LobbyChipAllNoAriaControls etc.)
 *    introspect each `<button class="lobby-chip">` child, not the
 *    parent track.
 *  - None of the existing pins would catch a regression that added
 *    `aria-haspopup="menu"` (or `="true"`, `="listbox"`, etc.) to
 *    the inner `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-haspopup") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether to fall back to the role's default popup semantics
 * (tablist has none).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-haspopup attribute (W2775)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-haspopup attribute", () => {
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

    // The pin: NO aria-haspopup attribute is authored on the chip strip.
    // A regression that adds `aria-haspopup="menu"` (claiming chips
    // open a popup menu), `aria-haspopup="listbox"`, or even
    // `aria-haspopup="true"` would fail here. The chip rail is a
    // flat, in-place toggle row — there is no popup affordance.
    expect(track!.hasAttribute("aria-haspopup")).toBe(false);
  });
});
