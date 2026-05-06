import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2940 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `placeholder` attribute.
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
 * `placeholder` is an HTML attribute whose only valid hosts are
 * form-input elements — `<input>` and `<textarea>` — where it carries
 * a short hint (a word or short phrase) describing the expected value
 * of the input. On a `<div role="tablist">` it is meaningless: no
 * user agent, no screen reader, and no spec consumer interprets
 * `placeholder` on a non-input/non-textarea element. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a text-entry field, so there is no
 *     "expected value" hint to show.
 *  2. Validators (W3C Nu, html-validate, axe) flag `placeholder` on
 *     non-input/non-textarea elements as an unknown/invalid
 *     attribute, polluting CI accessibility reports.
 *  3. A stray `placeholder="Filter..."` would imply the filter rail
 *     is a text input awaiting user keystrokes, confusing tooling
 *     that introspects DOM provenance (e.g. form-field extractors,
 *     autofill heuristics, automated form scrapers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `placeholder`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `placeholder`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `placeholder`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `placeholder` (form-input hint).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote-source URL) and silent
 *    on `placeholder`.
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
 *    absence — none of them currently cover `placeholder`. A
 *    regression that added `placeholder="Filter..."` (e.g. by
 *    mistakenly templating an input-style hint onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("placeholder") === false` AND
 * `track.getAttribute("placeholder") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an HTML attribute —
 * `placeholder` with an empty value is still authored, and any string
 * value is a regression. The companion `getAttribute(...) === null`
 * check belt-and-suspenders the assertion against any DOM-shim quirks
 * that might return an empty string for missing attributes.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no placeholder attribute (W2940)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a placeholder attribute", () => {
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

    // The pin: NO placeholder attribute is authored on the chip strip.
    // A regression that adds `placeholder=""`, `placeholder="Filter..."`,
    // or any other input-hint string would fail here.
    expect(track!.hasAttribute("placeholder")).toBe(false);
    expect(track!.getAttribute("placeholder")).toBeNull();
  });
});
