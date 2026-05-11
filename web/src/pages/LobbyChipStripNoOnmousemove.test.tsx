import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3135 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmousemove` attribute.
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
 * `onmousemove` is the legacy inline event-handler attribute that
 * fires on every pointer movement over the element. On a
 * `<div role="tablist">` it is meaningless and harmful because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no per-pixel pointer-tracking behavior. The
 *     existing wheel/drag scroll behavior is wired through React
 *     refs and `addEventListener`, not inline DOM0 attributes.
 *  2. Inline `on*` handlers are string-compiled by the HTML parser
 *     and execute in the global scope, bypassing React's synthetic
 *     event system and CSP `script-src` policies that forbid
 *     inline script — a stray `onmousemove="..."` would break any
 *     deployment that ships a strict CSP.
 *  3. `mousemove` fires at the device's pointer sampling rate
 *     (often 120-1000 Hz on modern hardware). Binding inline on
 *     the tablist would trigger a JS callback on every micro-
 *     movement across the filter rail, dwarfing the chip strip's
 *     own scroll math and tanking lobby paint performance.
 *  4. Validators (W3C Nu, html-validate, axe) and CSP linters
 *     flag inline event handlers as policy violations — authoring
 *     one on the chip strip would pollute CI reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onmousemove`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onmousemove`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to inline pointer handlers.
 *  - W2894 (LobbyChipStripNoCoords), W2903 (LobbyChipStripNoCite),
 *    and the broad LobbyChipStripNo* family (NoAccesskey, NoAutofocus,
 *    NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm, NoName,
 *    NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden, NoInert,
 *    NoSpellcheck, NoTranslate, NoContenteditable, NoAutocomplete,
 *    NoAutocapitalize, NoInputmode, NoHref, NoTarget, NoRel,
 *    NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget,
 *    NoVirtualkeyboardpolicy, NoWritingsuggestions, NoAriaAtomic,
 *    NoAriaBusy, NoAriaChecked, NoAriaControls, NoAriaCurrent,
 *    NoAriaDescribedBy, NoAriaDisabled, NoAriaExpanded,
 *    NoAriaHaspopup, NoAriaKeyshortcuts, NoAriaLive, NoAriaModal,
 *    NoAriaOrientation, NoAriaPressed, NoAriaReadonly,
 *    NoAriaRelevant, NoAriaRequired, NoAriaRoleDescription,
 *    NoAriaSelected, NoCoords, NoMethod, NoAction, NoUsemap,
 *    NoShape, NoCite) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover
 *    `onmousemove`. A regression that added `onmousemove="..."`
 *    (e.g. by mistakenly templating an inline DOM0 handler onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onmousemove") === false` AND
 * `track.getAttribute("onmousemove") === null`. The combination is
 * the canonical primitive for asserting total absence of an inline
 * event-handler attribute — `onmousemove=""` with an empty value is
 * still authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmousemove attribute (W3135)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmousemove attribute", () => {
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

    // The pin: NO onmousemove attribute is authored on the chip strip.
    // A regression that adds `onmousemove=""`, `onmousemove="handler()"`,
    // or any other inline DOM0 pointer-move binding would fail here.
    expect(track!.hasAttribute("onmousemove")).toBe(false);
    expect(track!.getAttribute("onmousemove")).toBeNull();
  });
});
