import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2929 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `formtarget` attribute.
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
 * `formtarget` is a form-submission HTML attribute whose only valid
 * hosts are `<button type="submit">` and `<input type="submit|image">`
 * — where it overrides the owning form's `target` attribute to specify
 * the browsing context (e.g. `_blank`, `_self`, a named frame) that
 * receives the form-submission response. On a `<div role="tablist">`
 * it is meaningless: the chip strip is not a submit button, is not
 * inside a `<form>`, and never triggers form submission. Authoring it
 * on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — those tabs swap a category filter in component state,
 *     they do not submit a form. There is no submission target to
 *     override.
 *  2. Validators (W3C Nu, html-validate, axe) flag `formtarget` on
 *     non-submit-button / non-submit-input elements as an
 *     unknown/invalid attribute, polluting CI accessibility reports.
 *  3. A stray `formtarget="_blank"` could trick automation, link
 *     scrapers, or future devs into thinking the chip strip opens a
 *     new browsing context on activation — confusing tooling that
 *     introspects DOM provenance and form wiring.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its form-submission attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `formtarget`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `formtarget`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `formtarget`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    quote-source URL attribute, orthogonal to form submission.
 *  - The broad family of LobbyChipStripNo* pins (NoForm, NoFormaction,
 *    NoFormenctype, NoFormmethod, NoFormnovalidate, NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoName,
 *    NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden, NoInert,
 *    NoSpellcheck, NoTranslate, NoContenteditable, NoAutocomplete,
 *    NoAutocapitalize, NoInputmode, NoHref, NoTarget, NoRel,
 *    NoDownload, NoAnchor, NoBlocking, NoElementtiming, NoExportparts,
 *    NoItemid, NoItemprop, NoItemref, NoItemscope, NoItemtype,
 *    NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCoords, NoMethod, NoAction, NoUsemap,
 *    NoShape, NoCite) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover `formtarget`. A regression
 *    that added `formtarget="_blank"` (e.g. by mistakenly templating a
 *    submit-button-style attribute onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("formtarget") === false` AND
 * `track.getAttribute("formtarget") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a form-submission
 * attribute — `formtarget` with an empty value is still authored, and
 * any string value is a regression. `getAttribute(...) === null` is
 * pinned alongside as a belt-and-suspenders check (DOM `getAttribute`
 * returns `null` only when the attribute is genuinely absent).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no formtarget attribute (W2929)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a formtarget attribute", () => {
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

    // The pin: NO formtarget attribute is authored on the chip strip.
    // A regression that adds `formtarget=""`, `formtarget="_blank"`,
    // or any other browsing-context name would fail here.
    expect(track!.hasAttribute("formtarget")).toBe(false);
    expect(track!.getAttribute("formtarget")).toBeNull();
  });
});
