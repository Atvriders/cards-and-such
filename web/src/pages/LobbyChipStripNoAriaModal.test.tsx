import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2781 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx
 * around L2623-L2628) carries NO `aria-modal` attribute.
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
 * The category filter strip is an inline, in-flow tablist — it is
 * NOT a modal surface. `aria-modal` is defined by WAI-ARIA to apply
 * specifically to elements that act as modal dialogs (typically
 * `role="dialog"` or `role="alertdialog"`), declaring that AT users
 * should treat content outside the element as inert until the modal
 * is dismissed. Stamping `aria-modal="true"` on a `role="tablist"`
 * filter rail would be semantically nonsensical and could cause AT
 * to mistakenly trap focus or hide the rest of the lobby (the hero,
 * the game grid, the recommended row, the drawer) from screen
 * readers — a serious accessibility regression. Even
 * `aria-modal="false"` would be redundant noise vs the role default
 * and would imply someone considered modal semantics for this
 * element at some point.
 *
 * Note that `aria-modal` IS legitimately used elsewhere in the
 * lobby — the family-picker overlay carries `aria-modal="true"`
 * (pinned by sibling test LobbyFamPickerAriaModal). That makes it
 * particularly important to pin its ABSENCE on the chip strip:
 * a future refactor that promoted the chip rail into a popover or
 * sheet (e.g. on small viewports collapsing the filters into a
 * modal sheet) could plausibly copy the family-picker's modal
 * attribute set onto the chip strip with no other test failing.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-modal`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-modal`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-modal` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on the same element — orthogonal to
 *    `aria-modal`.
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy`
 *    on the same element — orthogonal to `aria-modal`.
 *  - Sibling chip-strip "no-X" pins (NoAriaControls, NoAriaDescribedBy,
 *    NoAriaDisabled, NoAriaHaspopup, NoAriaOrientation, NoId, NoStyle,
 *    NoTabindex) each cover a single non-`aria-modal` attribute.
 *  - LobbyFamPickerAriaModal pins PRESENCE of `aria-modal` on the
 *    family-picker dialog — the inverse element.
 *  - LobbyDrawerToggleNoAriaModal pins absence on the DRAWER toggle
 *    button — a completely different element.
 *  - None of the existing pins would catch a regression that added
 *    `aria-modal="true"` (or `="false"`) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-modal") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether to treat the element as a modal surface.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-modal attribute (W2781)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-modal attribute", () => {
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

    // The pin: NO aria-modal attribute is authored on the chip strip.
    // A regression that adds `aria-modal="true"` (mistakenly claiming
    // the chip rail is a modal surface and risking focus-trapping /
    // inert-treatment of the rest of the lobby by AT) or even
    // `aria-modal="false"` (redundant noise vs the role default)
    // would fail here.
    expect(track!.hasAttribute("aria-modal")).toBe(false);
  });
});
