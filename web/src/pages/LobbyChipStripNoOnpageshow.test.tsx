import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3327 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpageshow` attribute.
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
 * `onpageshow` is a legacy inline event-handler content attribute
 * defined by HTML for the `pageshow` event, whose only valid host is
 * the `<body>` element (it forwards to `Window.onpageshow`). On a
 * `<div role="tablist">` it is meaningless: the `pageshow` event is
 * fired at the `Window`, not at arbitrary descendant elements, so the
 * attribute can never trigger from a `<div>`. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body and cannot receive
 *     `pageshow` events.
 *  2. Validators (W3C Nu, html-validate, axe) flag `onpageshow` on
 *     non-body elements as an invalid event-handler attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `onpageshow="..."` would imply an inline script handler
 *     bound to a non-firing event, confusing tooling that introspects
 *     DOM event-handler provenance (e.g. CSP auditors, inline-script
 *     scanners, security linters that flag inline JS attributes).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onpageshow`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onpageshow`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `onpageshow`.
 *  - W2894 (LobbyChipStripNoCoords) and W2903 (LobbyChipStripNoCite)
 *    each pin one specific legacy HTML attribute's absence — neither
 *    covers `onpageshow`.
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
 *    absence — none of them currently cover `onpageshow`. A
 *    regression that added `onpageshow="..."` (e.g. by mistakenly
 *    templating a body-style lifecycle handler onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onpageshow") === false` and
 * `track.getAttribute("onpageshow") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `onpageshow` with an empty value is still authored —
 * and the `getAttribute(...) === null` complement double-pins the
 * absence at the string-value boundary, so any non-null inline
 * handler string is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpageshow attribute (W3327)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpageshow attribute", () => {
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

    // The pin: NO onpageshow attribute is authored on the chip strip.
    // A regression that adds `onpageshow=""`,
    // `onpageshow="handler()"`, or any other inline event-handler
    // string would fail here.
    expect(track!.hasAttribute("onpageshow")).toBe(false);
    expect(track!.getAttribute("onpageshow")).toBeNull();
  });
});
