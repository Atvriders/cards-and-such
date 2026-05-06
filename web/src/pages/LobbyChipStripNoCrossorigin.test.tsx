import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2914 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `crossorigin` attribute.
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
 * `crossorigin` is a CORS-settings HTML attribute whose only valid
 * hosts are media/resource-loading elements: `<img>`, `<audio>`,
 * `<video>`, `<link>`, `<script>`, and `<source>` (where it controls
 * how the browser issues credentialed CORS fetches and whether the
 * resulting resource is exposed to the page via tainted-canvas /
 * `crossOriginIsolated` semantics). On a `<div role="tablist">` it is
 * meaningless: a `<div>` does not initiate any subresource fetch, so
 * there is no CORS-mode to negotiate. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it loads no external resource, so there is nothing
 *     for `crossorigin="anonymous"` or `crossorigin="use-credentials"`
 *     to gate.
 *  2. Validators (W3C Nu, html-validate) flag `crossorigin` on
 *     non-resource elements as an invalid attribute, polluting CI
 *     accessibility/HTML reports.
 *  3. A stray `crossorigin="anonymous"` on a `<div>` would mislead
 *     auditors and tooling that scrape DOM provenance for CORS-mode
 *     introspection (e.g. SRI checkers, CSP linters, and
 *     resource-integrity dashboards) into believing the chip rail
 *     participates in a cross-origin subresource handshake.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its CORS attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `crossorigin`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `crossorigin`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `crossorigin`.
 *  - W2894 (LobbyChipStripNoCoords), W2903 (NoCite), and the broad
 *    family of LobbyChipStripNo* pins (NoShape, NoUsemap, NoSrc,
 *    NoMethod, NoNovalidate, NoMultiple, NoReadonly, NoAccesskey,
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
 *    NoAriaSelected, NoAction) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover `crossorigin`.
 *    A regression that added `crossorigin="anonymous"` (e.g. by
 *    mistakenly copy-pasting an `<img>` / `<link>` attribute set onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("crossorigin") === false` AND
 * `track.getAttribute("crossorigin") === null`. `hasAttribute`
 * (rather than reading the IDL `crossOrigin` property) is the
 * canonical primitive for asserting absence of a content attribute —
 * `crossorigin` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no crossorigin attribute (W2914)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a crossorigin attribute", () => {
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

    // The pin: NO crossorigin attribute is authored on the chip strip.
    // A regression that adds `crossorigin=""`, `crossorigin="anonymous"`,
    // or `crossorigin="use-credentials"` would fail here.
    expect(track!.hasAttribute("crossorigin")).toBe(false);
    expect(track!.getAttribute("crossorigin")).toBeNull();
  });
});
