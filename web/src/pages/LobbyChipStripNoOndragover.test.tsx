import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3198 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondragover` attribute.
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
 * `ondragover` is the legacy HTML inline event-handler attribute
 * for the `dragover` event, fired continuously on a potential drop
 * target while a dragged item is over it. On a `<div role="tablist">`
 * chip filter rail it is meaningless: the chip strip is a horizontal
 * scroller of `role="tab"` buttons used to filter the lobby list — it
 * is not a drop target, it does not participate in any HTML5
 * drag-and-drop interaction, and there is no payload to accept.
 * Authoring `ondragover` on this element would be wrong because:
 *  1. The chip strip has no drag-and-drop affordance — there is no
 *     `ondragenter` / `ondrop` / `ondragleave` pairing on it either,
 *     so a lone `ondragover` handler (which exists primarily to call
 *     `event.preventDefault()` to enable dropping) could never
 *     complete a meaningful drag-and-drop sequence.
 *  2. Inline event-handler attributes are a long-standing
 *     code-quality anti-pattern: they bypass React's synthetic event
 *     system, attach a global-scope string-evaluated handler, are
 *     blocked by strict Content-Security-Policy `script-src` rules
 *     that forbid `unsafe-inline`, and cannot be removed by
 *     `removeEventListener`.
 *  3. Validators (W3C Nu, html-validate, eslint-plugin-react with
 *     `react/no-unknown-property`) flag stray inline handlers as
 *     code-smell or outright invalid attribute authoring, polluting
 *     CI accessibility and lint reports.
 *  4. A stray `ondragover="..."` would suggest the chip strip is a
 *     drop zone willing to accept dropped payloads, confusing
 *     assistive tech heuristics, drag-and-drop introspection tools,
 *     and human readers of the rendered HTML.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track's inline handler attributes at all.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on inline
 *    event-handler attributes.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on inline handlers.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — an ARIA attribute, orthogonal to a
 *    legacy DOM-0 inline event-handler attribute.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy image-map hotspot attribute, silent on drag handlers.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    quote-source attribute, silent on `ondragover`.
 *  - W3195 (LobbyChipStripNoOndragleave) pins absence of
 *    `ondragleave` — the sibling dragleave inline handler, silent
 *    on `ondragover` (the dragover phase is a distinct event in the
 *    HTML5 drag-and-drop lifecycle).
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
 *    NoCite, NoOndragleave) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover `ondragover`.
 *    A regression that added `ondragover="..."` (e.g. by mistakenly
 *    templating a drop-zone inline handler onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("ondragover") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null` alone) is
 * the canonical primitive for asserting absence of a legacy HTML
 * inline event-handler attribute — `ondragover` with an empty value
 * is still authored, and any string value is a regression. Both
 * forms are asserted here for belt-and-braces coverage.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondragover attribute (W3198)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondragover attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
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

    // The pin: NO ondragover attribute is authored on the chip strip.
    // A regression that adds `ondragover=""`, `ondragover="..."`, or
    // any other inline dragover handler binding would fail here.
    expect(track!.hasAttribute("ondragover")).toBe(false);
    expect(track!.getAttribute("ondragover")).toBeNull();
  });
});
