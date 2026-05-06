import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2924 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `formenctype` attribute.
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
 * `formenctype` is a form-submission HTML attribute whose only valid
 * hosts are `<button type="submit">` and `<input type="submit"|"image">`.
 * It overrides the owning `<form>`'s `enctype` (one of
 * `application/x-www-form-urlencoded`, `multipart/form-data`, or
 * `text/plain`) for that specific submit control. On a
 * `<div role="tablist">` it is meaningless: the chip strip is not a
 * submit control, has no owning form, and never participates in form
 * submission. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — none are `type="submit"`, and the container itself
 *     dispatches no form payload, so there is no encoding to override.
 *  2. Validators (W3C Nu, html-validate, axe) flag `formenctype` on
 *     non-submit elements as an unknown/invalid attribute, polluting
 *     CI accessibility and HTML-conformance reports.
 *  3. A stray `formenctype="multipart/form-data"` would imply the
 *     filter rail is a submit control overriding a form's encoding,
 *     confusing tooling that introspects DOM form semantics
 *     (e.g. form serializers, payload inspectors, automated
 *     submission harnesses).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its form-submission attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `formenctype`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `formenctype`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `formenctype`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `formenctype` (form encoding override).
 *  - The broad family of LobbyChipStripNo* pins (NoAccept,
 *    NoFormaction, NoReferrerpolicy, NoDecoding, NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCoords, NoMethod, NoAction, NoUsemap,
 *    NoShape) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover `formenctype`. A
 *    regression that added `formenctype="multipart/form-data"`
 *    (e.g. by mistakenly templating a submit-button attribute onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("formenctype") === false` AND
 * `track.getAttribute("formenctype") === null`. `hasAttribute`
 * (rather than `getAttribute(...) === null`) is the canonical
 * primitive for asserting absence of a form-submission HTML
 * attribute — `formenctype` with an empty value is still authored,
 * and any string value is a regression. The `getAttribute === null`
 * check is a belt-and-suspenders read-side mirror.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no formenctype attribute (W2924)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a formenctype attribute", () => {
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

    // The pin: NO formenctype attribute is authored on the chip strip.
    // A regression that adds `formenctype=""`,
    // `formenctype="multipart/form-data"`, or any other form-encoding
    // override binding would fail here.
    expect(track!.hasAttribute("formenctype")).toBe(false);
    expect(track!.getAttribute("formenctype")).toBeNull();
  });
});
