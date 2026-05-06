import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2894 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `coords` attribute.
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
 * `coords` is a legacy HTML attribute whose only valid hosts are the
 * `<area>` element inside an image map (where it defines the
 * coordinates of the clickable hotspot) and historically `<a>` (now
 * obsolete in HTML Living Standard). On a `<div role="tablist">` the
 * attribute is meaningless: no user agent, no screen reader, no
 * image-map handler, and no spec consumer interprets `coords` on a
 * non-`<area>` element. Authoring it on the chip-strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — there is no image-map semantic and no hotspot region
 *     to enumerate.
 *  2. Validators (W3C Nu, html-validate, axe) flag `coords` on
 *     non-`<area>` elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `coords="0,0,100,100"` would imply a clickable
 *     rectangle that does not exist, confusing tooling that
 *     introspects DOM hotspots (e.g. legacy assistive software,
 *     web-scrapers, automated UI testers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `coords`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `coords`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `coords`.
 *  - W2880 (LobbyChipStripNoAccesskey), W2804
 *    (LobbyChipStripNoAutofocus), and the broad family of
 *    LobbyChipStripNo* pins (NoTabindex, NoLang, NoDir, NoId, NoStyle,
 *    NoForm, NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce,
 *    NoHidden, NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoAriaAtomic, NoAriaBusy, NoAriaChecked,
 *    NoAriaControls, NoAriaCurrent, NoAriaDescribedBy, NoAriaDisabled,
 *    NoAriaExpanded, NoAriaHaspopup, NoAriaKeyshortcuts, NoAriaLive,
 *    NoAriaModal, NoAriaOrientation, NoAriaPressed, NoAriaReadonly,
 *    NoAriaRelevant, NoAriaRequired, NoAriaRoleDescription,
 *    NoAriaSelected) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover `coords`. A regression
 *    that added `coords="0,0,0,0"` (e.g. by mistakenly templating an
 *    `<area>`-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("coords") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `coords` with an empty value is still authored, and
 * any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no coords attribute (W2894)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a coords attribute", () => {
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

    // The pin: NO coords attribute is authored on the chip strip.
    // A regression that adds `coords=""`, `coords="0,0,100,100"`, or
    // any other image-map hotspot binding would fail here.
    expect(track!.hasAttribute("coords")).toBe(false);
  });
});
