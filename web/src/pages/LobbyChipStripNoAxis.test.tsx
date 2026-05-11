import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3003 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `axis` attribute.
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
 * `axis` is a legacy HTML4 table attribute whose only valid hosts were
 * `<td>` and `<th>` — where it carried a comma-separated list of
 * category names grouping the cell into conceptual table axes for
 * speech browsers. It was dropped entirely in HTML5; modern user
 * agents, screen readers, and validators do not recognise it. On a
 * `<div role="tablist">` it is doubly meaningless: it was never valid
 * on `<div>` even in HTML4, and the attribute itself is obsolete in
 * the current spec. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a table cell nor a table header, so
 *     there are no table axes to declare.
 *  2. Validators (W3C Nu, html-validate, axe) flag `axis` on
 *     non-table-cell elements (and on any element under HTML5) as an
 *     obsolete/invalid attribute, polluting CI accessibility reports.
 *  3. A stray `axis="category,filter"` would imply the filter rail is
 *     a table cell participating in a multi-axis data table, confusing
 *     legacy speech browsers and any tooling that still introspects
 *     HTML4 table-grouping hints.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `axis`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `axis`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `axis`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `axis` (HTML4 table-cell axis grouping).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `axis`.
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoAriaAtomic, NoAriaBusy, NoAriaChecked,
 *    NoAriaControls, NoAriaCurrent, NoAriaDescribedBy, NoAriaDisabled,
 *    NoAriaExpanded, NoAriaHaspopup, NoAriaKeyshortcuts, NoAriaLive,
 *    NoAriaModal, NoAriaOrientation, NoAriaPressed, NoAriaReadonly,
 *    NoAriaRelevant, NoAriaRequired, NoAriaRoleDescription,
 *    NoAriaSelected, NoCoords, NoMethod, NoAction, NoUsemap, NoShape,
 *    NoCite) each pin one specific global/legacy attribute's absence
 *    — none of them currently cover `axis`. A regression that added
 *    `axis="category,filter"` (e.g. by mistakenly templating an
 *    HTML4-table-cell attribute onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("axis") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `axis` with an empty value is still authored, and any
 * string value is a regression. Both forms are asserted here.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no axis attribute (W3003)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an axis attribute", () => {
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

    // The pin: NO axis attribute is authored on the chip strip.
    // A regression that adds `axis=""`, `axis="category,filter"`,
    // or any other HTML4 table-cell axis grouping binding would
    // fail here.
    expect(track!.hasAttribute("axis")).toBe(false);
    expect(track!.getAttribute("axis")).toBeNull();
  });
});
