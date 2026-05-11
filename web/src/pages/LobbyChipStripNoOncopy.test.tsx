import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3159 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncopy` attribute.
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
 * `oncopy` is the inline HTML event-handler attribute for the
 * `copy` clipboard event — when authored as a markup attribute its
 * string value is parsed as JavaScript and installed as the
 * element's `oncopy` event handler. On a `<div role="tablist">`
 * chip-strip it is meaningless and dangerous because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons; it is not a text-selection surface that the user is
 *     expected to copy from, so wiring a `copy`-event handler onto
 *     it serves no UX purpose.
 *  2. Inline event-handler attributes (`on*=...`) are exactly the
 *     authoring pattern that strict Content-Security-Policy headers
 *     forbid — a stray `oncopy="..."` on the tablist would either be
 *     stripped by CSP (silently breaking whatever the author
 *     intended) or, worse, would execute attacker-controlled markup
 *     if any field that flows into the chip strip were ever rendered
 *     unescaped.
 *  3. Validators and accessibility linters (axe, html-validate, W3C
 *     Nu) treat inline `on*` handlers as code smell and flag them
 *     in CI reports, polluting the accessibility / security signal.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track's attributes at all.
 *  - W1330 / W1331 (LobbyChipStripAria / AriaLabelExact) pin
 *    `role === "tablist"` and the exact `aria-label` string — both
 *    silent on inline event-handler attributes.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2894 (NoCoords),
 *    W2903 (NoCite), and the broader family of LobbyChipStripNo*
 *    pins (NoAccesskey, NoAutofocus, NoTabindex, NoLang, NoDir,
 *    NoId, NoStyle, NoForm, NoName, NoValue, NoSlot, NoPart, NoIs,
 *    NoNonce, NoHidden, NoInert, NoSpellcheck, NoTranslate,
 *    NoContenteditable, NoAutocomplete, NoAutocapitalize,
 *    NoInputmode, NoHref, NoTarget, NoRel, NoDownload, NoAnchor,
 *    NoBlocking, NoElementtiming, NoExportparts, NoItemid,
 *    NoItemprop, NoItemref, NoItemscope, NoItemtype, NoPopover,
 *    NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoAriaAtomic, NoAriaBusy, NoAriaChecked,
 *    NoAriaControls, NoAriaCurrent, NoAriaDescribedBy,
 *    NoAriaDisabled, NoAriaExpanded, NoAriaHaspopup,
 *    NoAriaKeyshortcuts, NoAriaLive, NoAriaModal, NoAriaOrientation,
 *    NoAriaPressed, NoAriaReadonly, NoAriaRelevant, NoAriaRequired,
 *    NoAriaRoleDescription, NoAriaSelected, NoMethod, NoAction,
 *    NoUsemap, NoShape) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover the inline
 *    `oncopy` clipboard event-handler attribute. A regression that
 *    added `oncopy="..."` (e.g. by mistakenly wiring a clipboard
 *    handler as a markup attribute instead of a `addEventListener`
 *    call) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("oncopy") === false` and
 * `track.getAttribute("oncopy") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a markup attribute
 * — `oncopy=""` (empty value) is still authored, and any string
 * value is a regression. The companion `getAttribute === null`
 * check pins the same fact from the value side, guarding against
 * the case where a custom attribute serializer or future React
 * version stringifies an absent attribute differently.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncopy attribute (W3159)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncopy attribute", () => {
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

    // The pin: NO oncopy attribute is authored on the chip strip.
    // A regression that adds `oncopy=""`, `oncopy="alert(1)"`, or
    // any other inline clipboard-copy event-handler binding would
    // fail here.
    expect(track!.hasAttribute("oncopy")).toBe(false);
    expect(track!.getAttribute("oncopy")).toBeNull();
  });
});
