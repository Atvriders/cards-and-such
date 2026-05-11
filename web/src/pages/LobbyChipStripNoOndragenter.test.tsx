import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3192 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondragenter` attribute.
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
 * `ondragenter` is a legacy inline event-handler content attribute
 * that fires when a dragged item enters a valid drop target. On a
 * `<div role="tablist">` that is purely a scroll/flex container of
 * `role="tab"` filter buttons, it is meaningless and dangerous:
 *  1. The chip strip is NOT a drop target — it is a filter rail for
 *     selecting a category. There is no drag-and-drop affordance to
 *     hook into, so any `ondragenter="..."` handler would be dead
 *     code at best and a misleading interactivity hint at worst.
 *  2. Inline event-handler attributes execute arbitrary JS strings
 *     in the global scope and bypass React's synthetic event system,
 *     CSP `script-src` nonces, and React's reconciliation. Authoring
 *     `ondragenter="evil()"` on the tablist would punch a hole
 *     straight through the app's event-delegation model.
 *  3. Validators and security scanners (axe, html-validate, CSP
 *     auditors) flag inline event-handler attributes on non-
 *     drop-target elements as suspicious, polluting CI reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `ondragenter`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `ondragenter`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — an ARIA state, not a DnD handler.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy image-map attribute, not a drag event handler.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    quote-source URL attribute, not a drag event handler.
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
 *    NoCite) each pin one specific global/legacy attribute's absence
 *    — none of them currently cover `ondragenter`. A regression that
 *    added `ondragenter="..."` (e.g. by mistakenly templating a
 *    drop-target inline handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("ondragenter") === false`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of an inline event-
 * handler content attribute — `ondragenter` with an empty value is
 * still authored, and any string value is a regression. We assert
 * both to be defensive.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondragenter attribute (W3192)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondragenter attribute", () => {
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

    // The pin: NO ondragenter inline event-handler attribute is
    // authored on the chip strip. A regression that adds
    // `ondragenter=""`, `ondragenter="handler()"`, or any other
    // inline DnD handler string would fail here.
    expect(track!.hasAttribute("ondragenter")).toBe(false);
    expect(track!.getAttribute("ondragenter")).toBeNull();
  });
});
