import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3007 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `bordercolor` attribute.
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
 * `bordercolor` is a legacy/proprietary HTML presentational attribute
 * (introduced by Netscape Navigator / Internet Explorer for `<table>`,
 * `<frame>`, and `<frameset>`) used to set the colour of the element's
 * border. It was never part of the HTML 4.01 strict spec, has been
 * obsolete in HTML5, and is entirely unsupported on a
 * `<div role="tablist">`:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a table nor a frame, so the historical
 *     hosts of `bordercolor` are irrelevant.
 *  2. Validators (W3C Nu, html-validate, axe) flag `bordercolor` on
 *     non-table/non-frame elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. Modern user agents ignore `bordercolor` outside its legacy
 *     hosts; presentational borders belong in CSS (`border-color`),
 *     not in HTML attributes. A stray `bordercolor="#ff0000"` on the
 *     chip strip would imply attempted inline visual styling, which
 *     conflicts with the design-token-driven CSS for `.lobby-chips`.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `bordercolor`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `bordercolor`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `bordercolor`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `bordercolor` (legacy table/frame border colour).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — silent on
 *    `bordercolor`.
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
 *    — none of them currently cover `bordercolor`. A regression that
 *    added `bordercolor="#ff0000"` (e.g. by mistakenly templating a
 *    legacy table/frame attribute onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("bordercolor") === false` AND
 * `track.getAttribute("bordercolor") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `bordercolor` with an empty value is still authored, and
 * any string value is a regression. The dual assertion belt-and-braces
 * both forms.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no bordercolor attribute (W3007)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a bordercolor attribute", () => {
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

    // The pin: NO bordercolor attribute is authored on the chip strip.
    // A regression that adds `bordercolor=""`, `bordercolor="#ff0000"`,
    // or any other legacy table/frame border-colour binding would fail
    // here.
    expect(track!.hasAttribute("bordercolor")).toBe(false);
    expect(track!.getAttribute("bordercolor")).toBeNull();
  });
});
