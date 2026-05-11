import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3125 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onkeyup` attribute.
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
 * `onkeyup` is a legacy inline event-handler attribute. In a React
 * tree, keyboard handling on the chip-strip tablist must go through
 * the synthetic event system (`onKeyDown`/`onKeyUp` props) or imperative
 * `addEventListener` on the ref — never via a stringly-typed inline
 * `onkeyup="..."` HTML attribute. Authoring `onkeyup` on the chip strip
 * would be wrong because:
 *  1. Inline event handlers execute attribute strings as JavaScript in
 *     the global scope, bypassing React's synthetic event system,
 *     component-scoped closures, and CSP `script-src` policies that
 *     disallow `'unsafe-inline'` event handlers.
 *  2. A strict Content Security Policy (the kind shipped on production
 *     auth/lobby surfaces) will refuse to execute inline handlers,
 *     silently breaking any keyboard navigation logic that was wired
 *     via `onkeyup="..."` — a class of bug that only surfaces in
 *     CSP-enforced environments and is invisible in dev.
 *  3. Validators and security linters (eslint-plugin-react, axe, CSP
 *     report-only headers) flag inline event-handler attributes as
 *     XSS-adjacent footguns: any attacker-controlled string that
 *     reaches the attribute is executed verbatim.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onkeyup`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onkeyup`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — an ARIA state attribute, not an inline
 *    event handler.
 *  - W2894 (LobbyChipStripNoCoords) and W2903 (LobbyChipStripNoCite)
 *    pin absence of legacy HTML content attributes (image-map coords,
 *    quote-source cite) — orthogonal to inline event-handler
 *    attributes.
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
 *    NoShape) each pin one specific global/legacy attribute's absence
 *    — none of them currently cover `onkeyup`. A regression that added
 *    `onkeyup="handleKey(event)"` (e.g. by mistakenly templating an
 *    inline handler onto the tablist instead of using the React
 *    `onKeyUp` prop) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onkeyup") === false` AND
 * `track.getAttribute("onkeyup") === null`. Both forms are asserted:
 * `hasAttribute` catches an authored empty `onkeyup=""`, while
 * `getAttribute` confirms no value is present. A regression authoring
 * any inline `onkeyup="..."` string would fail both checks.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onkeyup attribute (W3125)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onkeyup attribute", () => {
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

    // The pin: NO onkeyup attribute is authored on the chip strip.
    // A regression that adds `onkeyup=""`, `onkeyup="handleKey(event)"`,
    // or any other inline keyboard-event-handler binding would fail
    // here. Both `hasAttribute` and `getAttribute` are asserted to
    // catch both authored-empty and authored-with-value regressions.
    expect(track!.hasAttribute("onkeyup")).toBe(false);
    expect(track!.getAttribute("onkeyup")).toBeNull();
  });
});
