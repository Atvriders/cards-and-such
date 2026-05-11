import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3021 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `nowrap` attribute.
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
 * `nowrap` is a legacy HTML attribute whose only historically valid
 * hosts were `<td>` and `<th>` table cells (and the obsolete
 * `<div nowrap>` in some pre-HTML5 quirks-mode renderings), where it
 * instructed the browser to suppress automatic line wrapping inside
 * the cell. The attribute is OBSOLETE in HTML5 — the modern
 * equivalent is the CSS `white-space: nowrap` declaration. On a
 * `<div role="tablist">` it is meaningless: no user agent honors
 * `nowrap` on a non-cell element, no screen reader interprets it,
 * and the HTML5 spec explicitly removes it from the list of allowed
 * presentational attributes. Authoring it on the chip strip would
 * be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a table cell nor a layout primitive
 *     that ever supported `nowrap`.
 *  2. Validators (W3C Nu, html-validate, axe) flag `nowrap` on
 *     non-`<td>`/`<th>` elements as an unknown/obsolete attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `nowrap` would be a legacy presentational hint that
 *     bypasses the project's CSS-driven layout system (the chip
 *     strip's wrapping behavior is governed by `white-space` and
 *     `flex-wrap` in lobby.css, NOT by a deprecated HTML attribute).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `nowrap`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `nowrap`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `nowrap`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `nowrap` (table-cell line-wrap suppression).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `nowrap`.
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
 *    NoAriaSelected, NoCoords, NoCite, NoMethod, NoAction, NoUsemap,
 *    NoShape) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover `nowrap`. A regression
 *    that added `nowrap` (e.g. by copy-pasting a legacy table-cell
 *    snippet onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("nowrap") === false` AND
 * `track.getAttribute("nowrap") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `nowrap` with an empty value is still authored, and
 * any string value is a regression. The `getAttribute === null`
 * companion assertion guards against any DOM that might report
 * `hasAttribute === false` while still surfacing a non-null
 * `getAttribute` (defensive belt-and-braces).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no nowrap attribute (W3021)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a nowrap attribute", () => {
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

    // The pin: NO nowrap attribute is authored on the chip strip.
    // A regression that adds `nowrap`, `nowrap=""`, or any other
    // legacy line-wrap suppression binding would fail here.
    expect(track!.hasAttribute("nowrap")).toBe(false);
    expect(track!.getAttribute("nowrap")).toBeNull();
  });
});
