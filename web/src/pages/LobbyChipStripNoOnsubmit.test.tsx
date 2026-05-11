import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3145 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsubmit` attribute.
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
 * `onsubmit` is the inline event-handler attribute that fires when a
 * `<form>` is submitted. Its only valid host is a `<form>` element —
 * the browser dispatches the `submit` event on form submission, and
 * non-form elements never receive that event. On a `<div
 * role="tablist">` it is meaningless: the chip filter strip is a
 * scroll container of `role="tab"` buttons, not a form, so no
 * `submit` event will ever fire on it and no `onsubmit` handler would
 * ever run. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a form, so there is no submission event to
 *     handle.
 *  2. Inline event-handler attributes (`onsubmit="..."`) are a known
 *     XSS sink: any attacker-controllable string spliced into the
 *     attribute value is executed as JavaScript in the page origin.
 *     CSP `script-src` directives without `'unsafe-inline'` block
 *     these handlers, and modern security audits flag any inline
 *     event handler in the rendered DOM. Keeping the tablist free of
 *     `onsubmit` keeps the CSP report clean.
 *  3. Validators (W3C Nu, html-validate, axe) flag `onsubmit` on
 *     non-form elements as an unknown/invalid attribute, polluting CI
 *     accessibility and HTML-conformance reports.
 *  4. React's preferred pattern is `onSubmit={handler}` (camelCase
 *     prop) on a `<form>` element, which is transformed into a real
 *     DOM event listener — not a stringified inline handler
 *     attribute. A literal `onsubmit="..."` attribute on the rendered
 *     output would indicate a raw HTML attribute injection, which is
 *     a security regression.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy/inline event
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onsubmit`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onsubmit`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onsubmit`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `onsubmit` (form-submit handler).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent on
 *    `onsubmit`.
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
 *    absence — none of them currently cover `onsubmit`. A regression
 *    that added `onsubmit="..."` (e.g. by mistakenly templating a
 *    form-style attribute onto the tablist, or by a raw HTML
 *    attribute injection) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onsubmit") === false`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of an inline event
 * handler — `onsubmit` with an empty value is still authored, and
 * any string value is a regression. We assert both forms for
 * belt-and-braces coverage.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onsubmit attribute (W3145)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsubmit attribute", () => {
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

    // The pin: NO onsubmit attribute is authored on the chip strip.
    // A regression that adds `onsubmit=""`, `onsubmit="doStuff()"`,
    // or any other inline form-submit handler binding would fail
    // here. We assert both `hasAttribute` (catches empty-string
    // authoring) and `getAttribute` returning null (canonical
    // absence) for belt-and-braces coverage.
    expect(track!.hasAttribute("onsubmit")).toBe(false);
    expect(track!.getAttribute("onsubmit")).toBeNull();
  });
});
