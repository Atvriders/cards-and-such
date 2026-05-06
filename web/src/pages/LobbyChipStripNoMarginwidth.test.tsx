import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2976 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `marginwidth` attribute.
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
 * `marginwidth` is a legacy HTML presentational attribute whose only
 * historical hosts were `<body>`, `<frame>`, and `<iframe>` — where it
 * carried a pixel value used by the user agent to inset the embedded
 * document's left/right margins from the containing frame edge. It was
 * removed from HTML5 in favor of CSS `margin` / `padding`, and even on
 * its legacy hosts it is now considered obsolete. On a
 * `<div role="tablist">` it is meaningless: no user agent, no screen
 * reader, and no spec consumer interprets `marginwidth` on a non-frame
 * element. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a body nor a frame/iframe, so there is
 *     no embedded-document margin to inset.
 *  2. Validators (W3C Nu, html-validate, axe) flag `marginwidth` on
 *     non-frame elements as an unknown/obsolete attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `marginwidth="0"` would imply the chip strip is a
 *     framed embedded document, confusing tooling that introspects
 *     DOM provenance (e.g. legacy frame migration scripts, semantic
 *     HTML linters, automated layout extractors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `marginwidth`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `marginwidth`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `marginwidth`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `marginwidth` (frame margin inset).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `marginwidth`.
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
 *    — none of them currently cover `marginwidth`. A regression that
 *    added `marginwidth="0"` (e.g. by mistakenly templating a legacy
 *    frame-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("marginwidth") === false` plus
 * `track.getAttribute("marginwidth") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `marginwidth` with an empty value is still authored,
 * and any string value is a regression. The redundant `getAttribute`
 * check guards against any DOM polyfill that might diverge between
 * presence-tests and value-reads.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no marginwidth attribute (W2976)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a marginwidth attribute", () => {
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

    // The pin: NO marginwidth attribute is authored on the chip strip.
    // A regression that adds `marginwidth=""`, `marginwidth="0"`, or
    // any other frame-margin pixel binding would fail here.
    expect(track!.hasAttribute("marginwidth")).toBe(false);
    expect(track!.getAttribute("marginwidth")).toBeNull();
  });
});
