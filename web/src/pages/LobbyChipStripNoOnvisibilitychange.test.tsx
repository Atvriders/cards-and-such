import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3321 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onvisibilitychange` attribute.
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
 * `onvisibilitychange` is the inline event-handler attribute for the
 * Page Visibility API's `visibilitychange` event. It is only meaningful
 * on `Document` (i.e. set via `document.onvisibilitychange = ...` or
 * `document.addEventListener("visibilitychange", ...)`). On an arbitrary
 * `<div role="tablist">` it is meaningless: the `visibilitychange` event
 * does not bubble through ordinary DOM elements, so authoring
 * `onvisibilitychange="..."` on the chip strip would:
 *  1. Be a no-op at runtime — no user agent dispatches
 *     `visibilitychange` events to a `<div>`; the handler would never
 *     fire and would silently rot.
 *  2. Be flagged by validators (W3C Nu, html-validate) as an unknown
 *     attribute on a non-Document element, polluting CI reports.
 *  3. Pollute the element's attribute surface with an inline-handler
 *     string that CSP `script-src` policies (and CSP-style code
 *     reviews) treat as a smell, since inline event handlers are a
 *     common XSS vector when their value is templated from user input.
 *  4. Suggest to readers that the chip strip cares about page-visibility
 *     transitions, when in fact LobbyPage handles any such concern
 *     centrally (e.g. via a `document.addEventListener` effect), not
 *     by sprinkling per-element handlers.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - The broad family of LobbyChipStripNo* pins (NoCite, NoCoords,
 *    NoAccesskey, NoAutofocus, NoTabindex, NoLang, NoDir, NoId,
 *    NoStyle, NoForm, NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce,
 *    NoHidden, NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoAriaMultiselectable, NoAriaAtomic,
 *    NoAriaBusy, NoAriaChecked, NoAriaControls, NoAriaCurrent,
 *    NoAriaDescribedBy, NoAriaDisabled, NoAriaExpanded, NoAriaHaspopup,
 *    NoAriaKeyshortcuts, NoAriaLive, NoAriaModal, NoAriaOrientation,
 *    NoAriaPressed, NoAriaReadonly, NoAriaRelevant, NoAriaRequired,
 *    NoAriaRoleDescription, NoAriaSelected, NoMethod, NoAction,
 *    NoUsemap, NoShape) each pin one specific global / legacy / inline
 *    event-handler attribute's absence — none of them currently cover
 *    `onvisibilitychange`. A regression that added
 *    `onvisibilitychange="doSomething()"` (e.g. by mistakenly migrating
 *    a Document-level visibility handler down onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onvisibilitychange") === false` and
 * `track.getAttribute("onvisibilitychange") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of an inline event-handler
 * attribute — an empty `onvisibilitychange=""` is still authored, and
 * any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onvisibilitychange attribute (W3321)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onvisibilitychange attribute", () => {
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

    // The pin: NO onvisibilitychange attribute is authored on the chip
    // strip. A regression that adds `onvisibilitychange=""`,
    // `onvisibilitychange="handler()"`, or any other inline-handler
    // binding would fail here.
    expect(track!.hasAttribute("onvisibilitychange")).toBe(false);
    expect(track!.getAttribute("onvisibilitychange")).toBeNull();
  });
});
