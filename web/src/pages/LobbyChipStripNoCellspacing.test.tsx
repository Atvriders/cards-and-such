import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3011 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `cellspacing` attribute.
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
 * `cellspacing` is a legacy HTML presentational attribute whose only
 * valid host is `<table>` — where (in HTML 4 / pre-CSS layout) it
 * controlled the spacing BETWEEN adjacent table cells (the gap from
 * one cell's border to its neighbor's border). It is obsolete in
 * HTML5 (replaced by CSS `border-spacing` on the table itself) and
 * is meaningless on a `<div role="tablist">`: no user agent honors
 * `cellspacing` on a non-table element, no screen reader interprets
 * it, and no spec consumer routes layout off it. Authoring it on the
 * chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a `<table>` nor a table-derived
 *     element, so there is no cell-to-cell gap to size.
 *  2. Validators (W3C Nu, html-validate, axe) flag `cellspacing` on
 *     non-table elements as an unknown/obsolete attribute, polluting
 *     CI accessibility and conformance reports.
 *  3. A stray `cellspacing="2"` would imply table-cell layout
 *     semantics on the filter rail, confusing tooling that
 *     introspects DOM provenance (e.g. legacy-table linters,
 *     CSS-to-HTML migration scripts, accessibility auditors that
 *     warn on presentational attributes outside `<table>`).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `cellspacing`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `cellspacing`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `cellspacing`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `cellspacing` (table inter-cell gap).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `cellspacing`.
 *  - W3009 (LobbyChipStripNoCellpadding) pins absence of
 *    `cellpadding` — a sibling legacy table attribute (intra-cell
 *    padding) but distinct from `cellspacing` (inter-cell gap). A
 *    regression could authentic one without the other.
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
 *    NoCite, NoCellpadding) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover
 *    `cellspacing`. A regression that added `cellspacing="2"` (e.g.
 *    by mistakenly templating a table-style attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("cellspacing") === false` AND
 * `track.getAttribute("cellspacing") === null`. `hasAttribute`
 * (rather than `getAttribute(...) === null` alone) is the canonical
 * primitive for asserting absence of a legacy HTML attribute —
 * `cellspacing` with an empty value is still authored, and any
 * string value is a regression. We assert both to cover the
 * empty-string edge case explicitly.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no cellspacing attribute (W3011)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a cellspacing attribute", () => {
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

    // The pin: NO cellspacing attribute is authored on the chip strip.
    // A regression that adds `cellspacing=""`, `cellspacing="2"`, or
    // any other table inter-cell gap binding would fail here.
    expect(track!.hasAttribute("cellspacing")).toBe(false);
    expect(track!.getAttribute("cellspacing")).toBeNull();
  });
});
