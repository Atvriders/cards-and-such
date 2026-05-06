import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2927 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `formmethod` attribute.
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
 * `formmethod` is an HTML attribute whose only valid hosts are
 * `<button type="submit">` and `<input type="submit"|"image">` — where
 * it overrides the parent form's `method` (GET/POST/dialog) for that
 * specific submitter. On a `<div role="tablist">` it is meaningless:
 * no user agent treats `formmethod` on a non-submit-button element,
 * and there is no enclosing form whose method could be overridden.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a submit button nor an input, so there
 *     is no submission HTTP method to override.
 *  2. Validators (W3C Nu, html-validate, axe) flag `formmethod` on
 *     non-submitter elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `formmethod="post"` would imply the filter rail
 *     participates in a form submission flow with a specific HTTP
 *     verb, confusing tooling that introspects DOM provenance (e.g.
 *     form scrapers, automated submission analysers, security
 *     scanners that flag unexpected submission verbs).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its form-related attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `formmethod`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `formmethod`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `formmethod`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `formmethod` (form submission HTTP method override).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a quote
 *    source URL attribute, silent on `formmethod`.
 *  - W2923 (LobbyChipStripNoFormaction) pins absence of `formaction`
 *    — the form submission URL override, distinct from `formmethod`
 *    (the HTTP verb override).
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
 *    NoCite, NoFormaction, NoFormenctype) each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `formmethod`. A regression that added `formmethod="post"` (e.g.
 *    by mistakenly templating a submit-button attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("formmethod") === false` AND
 * `track.getAttribute("formmethod") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an HTML attribute —
 * `formmethod` with an empty value is still authored, and any string
 * value is a regression. `getAttribute === null` is asserted alongside
 * for symmetry with the absent-attribute contract.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no formmethod attribute (W2927)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a formmethod attribute", () => {
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

    // The pin: NO formmethod attribute is authored on the chip strip.
    // A regression that adds `formmethod=""`, `formmethod="post"`,
    // or any other HTTP-verb binding would fail here.
    expect(track!.hasAttribute("formmethod")).toBe(false);
    expect(track!.getAttribute("formmethod")).toBeNull();
  });
});
