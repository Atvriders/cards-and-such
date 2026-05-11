import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3074 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `vspace` attribute.
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
 * `vspace` is an obsolete HTML attribute that, when authored, was only
 * meaningful on `<img>`, `<object>`, `<applet>`, `<embed>`, `<iframe>`,
 * `<input type="image">`, and `<marquee>` — where it specified the
 * vertical whitespace (in pixels) above and below the embedded element.
 * It has been removed from HTML5 in favor of CSS margin properties
 * (`margin-top` / `margin-bottom`). On a `<div role="tablist">` it is
 * meaningless: no user agent applies vertical whitespace from `vspace`
 * on a non-embedded element, and no spec consumer interprets it.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an image, object, applet, embed, iframe,
 *     image input, nor a marquee, so `vspace` has no defined effect.
 *  2. Validators (W3C Nu, html-validate, axe) flag `vspace` on
 *     non-embedded elements as an obsolete/invalid attribute, polluting
 *     CI accessibility and validity reports.
 *  3. A stray `vspace="10"` would imply the filter rail wants
 *     legacy-presentational vertical margin, bypassing the CSS layout
 *     system and confusing tooling that introspects DOM provenance
 *     (e.g. legacy-attribute linters, semantic web crawlers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `vspace`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `vspace`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `vspace`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `vspace` (legacy vertical margin).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `vspace`.
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
 *    absence — none of them currently cover `vspace`. A regression
 *    that added `vspace="10"` (e.g. by mistakenly templating a
 *    legacy-img-style attribute onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("vspace") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null` alone) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `vspace` with an empty value is still authored, and
 * any string value is a regression. We additionally pin
 * `getAttribute("vspace") === null` for belt-and-suspenders coverage:
 * the two checks together close the door on every authored shape.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no vspace attribute (W3074)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a vspace attribute", () => {
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

    // The pin: NO vspace attribute is authored on the chip strip.
    // A regression that adds `vspace=""`, `vspace="10"`, or any other
    // legacy vertical-margin binding would fail here.
    expect(track!.hasAttribute("vspace")).toBe(false);
    expect(track!.getAttribute("vspace")).toBeNull();
  });
});
