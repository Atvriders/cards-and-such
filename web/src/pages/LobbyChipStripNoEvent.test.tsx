import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3054 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `event` attribute.
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
 * `event` is a legacy/non-standard HTML attribute most famously
 * associated with the obsolete `<script for="..." event="...">`
 * pairing (an IE-era DHTML event-binding mechanism removed from the
 * HTML spec). It has no meaning on a `<div role="tablist">`: no user
 * agent dispatches script handlers based on a `event` content
 * attribute, and the modern equivalent is the `on*` IDL attributes /
 * `addEventListener` rather than a string-named content attribute.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no scripting-host semantics that a `event`
 *     attribute could bind into.
 *  2. Validators (W3C Nu, html-validate, axe) flag `event` on
 *     non-script elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `event="onclick"` (or any other handler-name string)
 *     would imply a legacy script-binding contract that does not
 *     exist on this element, confusing tooling that introspects DOM
 *     event surfaces (e.g. devtools event-listener inspectors,
 *     static analyzers that grep for handler-attribute strings).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `event`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `event`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `event`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `event` (legacy script binding name).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a quote
 *    source URL attribute, silent on `event`.
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
 *    absence — none of them currently cover `event`. A regression
 *    that added `event="onclick"` (e.g. by mistakenly templating a
 *    legacy script-binding attribute onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("event") === false` and
 * `track.getAttribute("event") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a legacy HTML attribute — `event` with an empty value is still
 * authored, and any string value is a regression. The
 * `getAttribute(...) === null` companion check defends against any
 * future DOM polyfill that conflates "attribute present with empty
 * value" and "attribute absent".
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no event attribute (W3054)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an event attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO event attribute is authored on the chip strip.
    // A regression that adds `event=""`, `event="onclick"`, or any
    // other legacy script-binding name would fail here.
    expect(track!.hasAttribute("event")).toBe(false);
    expect(track!.getAttribute("event")).toBeNull();
  });
});
