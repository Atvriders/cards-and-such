import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2797 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-required` attribute.
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
 * `aria-required` is defined for input-collecting widgets — it
 * indicates that user input is required on the element before a
 * form may be submitted (combobox, listbox, radiogroup, textbox,
 * spinbutton, tree, etc.). A `role="tablist"` is NOT in the set of
 * roles that supports `aria-required`: tabs are a navigational
 * affordance, not a data-collection control. Authoring
 * `aria-required` on the chip strip would be semantically
 * incoherent — there is no form submission gated on chip selection,
 * and the property has no defined meaning on `tablist`.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-required`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-required`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-required` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2767
 *    (LobbyChipStripNoAriaBusy), and the sibling W27xx pins
 *    (NoAriaChecked, NoAriaControls, NoAriaCurrent,
 *    NoAriaDescribedBy, NoAriaDisabled, NoAriaExpanded,
 *    NoAriaHaspopup, NoAriaModal, NoAriaOrientation,
 *    NoAriaPressed, NoAriaSelected) each cover a different
 *    ARIA attribute on the same element — none of them touch
 *    `aria-required`.
 *  - None of the existing pins would catch a regression that added
 *    `aria-required="true"` (or `="false"`) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-required") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether to fall back to the role's default required semantics.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-required attribute (W2797)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-required attribute", () => {
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

    // The pin: NO aria-required attribute is authored on the chip strip.
    // A regression that adds `aria-required="true"` (semantically
    // claiming chip selection is required for form submission, which
    // is meaningless on a `tablist`) or even `aria-required="false"`
    // (redundant noise vs the role default) would fail here.
    expect(track!.hasAttribute("aria-required")).toBe(false);
  });
});
