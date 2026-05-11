import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3031 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `bordercolordark` attribute.
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
 * `bordercolordark` is a non-standard, proprietary, legacy HTML
 * attribute originally introduced by Microsoft Internet Explorer for
 * `<table>`, `<td>`, `<th>`, `<tr>`, and `<frame>` elements to specify
 * the darker shade of a 3D-bevelled border. It was never part of any
 * W3C HTML specification, has been removed from all modern browser
 * engines, and is meaningless on a `<div role="tablist">` because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a table cell nor a frame, so there is
 *     no 3D border to darken.
 *  2. Validators (W3C Nu, html-validate, axe) flag
 *     `bordercolordark` on any element as an unknown/invalid
 *     attribute, polluting CI accessibility reports.
 *  3. A stray `bordercolordark="#000080"` would resurrect a
 *     Netscape-era visual quirk that no modern user agent honors,
 *     while still bloating the DOM payload and confusing automated
 *     style introspection tools.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `bordercolordark`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `bordercolordark`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `bordercolordark`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    HTML attribute for quotation source URLs.
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
 *    absence — none of them currently cover `bordercolordark`. A
 *    regression that added `bordercolordark="#000080"` (e.g. by
 *    accidentally templating a legacy IE table border attribute onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("bordercolordark") === false` AND
 * `track.getAttribute("bordercolordark") === null`. Both primitives
 * are asserted because:
 *  - `hasAttribute` returns false iff the attribute was never
 *    authored (even an empty string `bordercolordark=""` would flip
 *    it to true).
 *  - `getAttribute(...) === null` reinforces that no value of any
 *    kind is associated — a regression authoring
 *    `bordercolordark=""` would fail `hasAttribute`, while a
 *    regression that somehow set the property via `setAttribute`
 *    with any string would fail `getAttribute`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no bordercolordark attribute (W3031)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a bordercolordark attribute", () => {
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

    // The pin: NO bordercolordark attribute is authored on the chip
    // strip. A regression that adds `bordercolordark=""`,
    // `bordercolordark="#000080"`, or any other legacy IE
    // dark-border-color binding would fail here.
    expect(track!.hasAttribute("bordercolordark")).toBe(false);
    expect(track!.getAttribute("bordercolordark")).toBeNull();
  });
});
