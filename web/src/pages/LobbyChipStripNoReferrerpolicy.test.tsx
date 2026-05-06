import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2919 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `referrerpolicy` attribute.
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
 * `referrerpolicy` is a fetch/navigation HTML attribute whose only
 * valid hosts are elements that initiate a network request:
 * `<a>`, `<area>`, `<img>`, `<iframe>`, `<link>`, and `<script>`.
 * On a `<div role="tablist">` it is meaningless: the chip strip is a
 * non-fetching flex/scroll container of `role="tab"` buttons — it
 * issues no HTTP request, so there is no Referer header for any
 * policy to govern. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip never initiates a fetch or navigation — it is
 *     purely an in-page tablist of filter buttons. `referrerpolicy`
 *     has no observable effect on a `<div>`.
 *  2. Validators (W3C Nu, html-validate, axe) flag `referrerpolicy`
 *     on non-fetching elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `referrerpolicy="no-referrer"` would imply the chip
 *     strip somehow gates outbound Referer headers, confusing tooling
 *     that introspects DOM provenance (e.g. CSP/referrer auditors,
 *     security crawlers, automated network-policy extractors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its fetch-related attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `referrerpolicy`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `referrerpolicy`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `referrerpolicy`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy image-map hotspot attribute, silent on `referrerpolicy`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    quote-source URL attribute, silent on `referrerpolicy`.
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
 *    — none of them currently cover `referrerpolicy`. A regression
 *    that added `referrerpolicy="no-referrer"` (e.g. by mistakenly
 *    templating an `<a>`-style attribute onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("referrerpolicy") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a fetch HTML
 * attribute — `referrerpolicy` with an empty value is still
 * authored, and any string value is a regression. We assert both
 * forms for defense-in-depth.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no referrerpolicy attribute (W2919)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a referrerpolicy attribute", () => {
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

    // The pin: NO referrerpolicy attribute is authored on the chip
    // strip. A regression that adds `referrerpolicy=""`,
    // `referrerpolicy="no-referrer"`, `referrerpolicy="origin"`, or
    // any other Referrer-Policy token binding would fail here.
    expect(track!.hasAttribute("referrerpolicy")).toBe(false);
    expect(track!.getAttribute("referrerpolicy")).toBeNull();
  });
});
