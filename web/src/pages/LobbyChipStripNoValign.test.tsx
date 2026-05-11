import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3027 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `valign` attribute.
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
 * `valign` is a legacy HTML presentational attribute whose only valid
 * historical hosts were table-related elements: `<col>`, `<colgroup>`,
 * `<tbody>`, `<td>`, `<tfoot>`, `<th>`, `<thead>`, and `<tr>` — where
 * it specified vertical alignment of cell contents (top / middle /
 * bottom / baseline). It was obsoleted in HTML5 in favor of the CSS
 * `vertical-align` property. On a `<div role="tablist">` it is
 * meaningless for several reasons:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a table cell, row, or column group, so
 *     vertical-alignment-of-cell-contents semantics do not apply.
 *  2. `valign` is an obsolete attribute even on its historical hosts;
 *     authoring it on a non-table element is doubly wrong (wrong
 *     element AND deprecated attribute).
 *  3. Validators (W3C Nu, html-validate, axe) flag `valign` on
 *     non-table elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  4. A stray `valign="middle"` would have zero rendering effect (the
 *     chip-strip layout is driven by CSS flexbox, not table-cell
 *     vertical-align), but would still confuse linters, semantic
 *     analyzers, and any tooling that introspects DOM provenance.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `valign`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `valign`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `valign`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `valign` (table-cell vertical alignment).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `valign`.
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
 *    — none of them currently cover `valign`. A regression that added
 *    `valign="middle"` (e.g. by mistakenly templating a table-cell
 *    alignment attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("valign") === false` AND
 * `track.getAttribute("valign") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `valign` with an empty value is still authored, and
 * any string value is a regression. The companion `getAttribute(...)
 * === null` assertion guards the corollary contract: a present
 * attribute would return a string (even `""`), so `null` proves
 * non-presence from the reader API as well.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no valign attribute (W3027)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a valign attribute", () => {
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

    // The pin: NO valign attribute is authored on the chip strip.
    // A regression that adds `valign=""`, `valign="middle"`,
    // `valign="top"`, or any other table-cell vertical-alignment
    // value would fail here.
    expect(track!.hasAttribute("valign")).toBe(false);
    expect(track!.getAttribute("valign")).toBeNull();
  });
});
