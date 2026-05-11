import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3147 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onfocusin` attribute.
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
 * `onfocusin` is a legacy inline event-handler content attribute that
 * binds a JavaScript string to the `focusin` event. Authoring it on
 * the chip strip would be wrong because:
 *  1. The codebase wires focus behavior through React synthetic
 *     handlers (`onFocus`, refs, and explicit listeners) — never via
 *     inline `onfocusin="..."` attribute strings. A stray attribute
 *     would imply an out-of-band globally-scoped handler.
 *  2. Inline event-handler attributes execute their string contents
 *     as JavaScript in the global scope, bypassing CSP `script-src`
 *     allow-lists unless `'unsafe-inline'` is granted to event
 *     handlers — exactly the surface modern CSP hardening forbids.
 *  3. Validators and linters (eslint-plugin-react, html-validate,
 *     axe) flag inline event handlers on JSX-rendered elements as
 *     anti-patterns, polluting CI accessibility/security reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — silent on inline event handlers.
 *  - W1330 / W1331 (LobbyChipStripAria, AriaLabelExact) pin
 *    `role === "tablist"` and the `aria-label` text — silent on
 *    `onfocusin`.
 *  - W2754 (NoAriaMultiselectable), W2894 (NoCoords), W2903
 *    (NoCite) each pin one specific legacy/global attribute's
 *    absence — none of them cover `onfocusin`.
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
 *    NoAriaSelected, NoCoords, NoMethod, NoAction, NoUsemap, NoShape)
 *    each pin one specific global/legacy attribute's absence — none
 *    of them currently cover `onfocusin`. A regression that added
 *    `onfocusin="handleFocus()"` (e.g. by mistakenly templating an
 *    inline event handler attribute onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("onfocusin") === false` AND
 * `track.getAttribute("onfocusin") === null`. `hasAttribute`
 * (combined with `getAttribute(...) === null`) is the canonical
 * primitive for asserting absence of an inline event-handler content
 * attribute — `onfocusin=""` with an empty value is still authored,
 * and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onfocusin attribute (W3147)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onfocusin attribute", () => {
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

    // The pin: NO onfocusin attribute is authored on the chip strip.
    // A regression that adds `onfocusin=""`, `onfocusin="handler()"`,
    // or any other inline event-handler string would fail here.
    expect(track!.hasAttribute("onfocusin")).toBe(false);
    expect(track!.getAttribute("onfocusin")).toBeNull();
  });
});
