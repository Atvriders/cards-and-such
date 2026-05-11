import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3088 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `formnovalidate` attribute.
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
 * `formnovalidate` is a boolean HTML attribute whose only valid hosts
 * are `<button type="submit">` and `<input type="submit"|"image">` —
 * where it instructs the user agent to skip form-level constraint
 * validation when that specific submitter is activated. On a
 * `<div role="tablist">` it is meaningless: a div is not a form
 * submitter, so there is no validation step to bypass and no user
 * agent, form-control API, or constraint-validation pipeline that
 * inspects `formnovalidate` on a non-submit element. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a form submit button nor an image
 *     submit input, so there is no implicit form submission to skip
 *     validation for.
 *  2. Validators (W3C Nu, html-validate, axe) flag `formnovalidate`
 *     on non-submit elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `formnovalidate` (or `formnovalidate=""`) would imply
 *     the chip strip participates in form submission semantics,
 *     confusing tooling that introspects DOM form associations
 *     (e.g. form-validation polyfills, autofill heuristics,
 *     accessibility tree builders that special-case submitters).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `formnovalidate`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `formnovalidate`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `formnovalidate`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `formnovalidate` (form-submit validation bypass).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `formnovalidate`.
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
 *    absence — none of them currently cover `formnovalidate`. A
 *    regression that added `formnovalidate` (e.g. by mistakenly
 *    templating a submit-button attribute onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("formnovalidate") === false` AND
 * `track.getAttribute("formnovalidate") === null`. `hasAttribute`
 * (rather than only `getAttribute(...) === null`) is the canonical
 * primitive for asserting absence of a boolean HTML attribute —
 * `formnovalidate` with an empty value is still authored, and any
 * presence at all is a regression. The `getAttribute` check is a
 * defense-in-depth companion: it catches the same regression from a
 * different DOM API entry point.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no formnovalidate attribute (W3088)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a formnovalidate attribute", () => {
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

    // The pin: NO formnovalidate attribute is authored on the chip
    // strip. A regression that adds `formnovalidate`,
    // `formnovalidate=""`, or any other boolean-attribute spelling
    // would fail here.
    expect(track!.hasAttribute("formnovalidate")).toBe(false);
    expect(track!.getAttribute("formnovalidate")).toBeNull();
  });
});
