import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2785 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-expanded` attribute.
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
 * `aria-expanded` is defined for elements that act as a disclosure
 * control — e.g. buttons that toggle a collapsible region, combobox
 * inputs, or treeitems with collapsible subtrees. The `tablist`
 * role is NOT in the list of roles that support `aria-expanded`
 * (per ARIA 1.2 §6.6.1 — "tablist" is a composite widget container
 * whose `aria-orientation` and child `aria-selected` semantics
 * fully describe its state). Adding `aria-expanded` here would be
 * an authoring error that some AT pipelines surface as a console
 * warning and that others silently ignore — either way it muddles
 * the semantic contract of the filter rail.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy`
 *    on the same element — orthogonal to `aria-expanded`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `aria-expanded`.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text — silent on `aria-expanded`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — silent on `aria-expanded`.
 *  - LobbyChipStripNoAriaControls / NoAriaCurrent / NoAriaDescribedBy /
 *    NoAriaDisabled / NoAriaHaspopup / NoAriaOrientation each pin a
 *    different absent ARIA attribute — none of them touch
 *    `aria-expanded`.
 *  - LobbyTileAriaExpandedInitial pins `aria-expanded` ON A TILE
 *    menu trigger button, an entirely different element in a
 *    different subtree; it does not constrain the chip-strip track.
 *  - None of the existing pins would catch a regression that added
 *    `aria-expanded="true"` (or `="false"`) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-expanded") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether to fall back to the role's default expansion semantics
 * (which, for `tablist`, is "no expansion semantic at all").
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-expanded attribute (W2785)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-expanded attribute", () => {
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

    // The pin: NO aria-expanded attribute is authored on the chip strip.
    // A regression that adds `aria-expanded="true"` or
    // `aria-expanded="false"` (mis-applying a disclosure semantic to
    // a tablist composite) would fail here.
    expect(track!.hasAttribute("aria-expanded")).toBe(false);
  });
});
