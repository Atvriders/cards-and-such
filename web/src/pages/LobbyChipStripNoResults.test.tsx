import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3095 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `results` attribute.
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
 * `results` is a legacy non-standard WebKit attribute whose only
 * historical host is `<input type="search">` — where it once advised
 * Safari on how many recent search entries to surface in the input's
 * dropdown. On a `<div role="tablist">` it is meaningless: no user
 * agent, no screen reader, and no spec consumer interprets `results`
 * on a non-search-input element. Authoring it on the chip strip would
 * be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a search input nor any input element,
 *     so there is no recent-search history to surface.
 *  2. Validators (W3C Nu, html-validate, axe) flag `results` on
 *     non-input elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `results="5"` would imply the filter rail is a Safari
 *     search input wired to a recent-search dropdown, confusing
 *     tooling that introspects DOM provenance (e.g. form analyzers,
 *     search-UI scrapers, WebKit-specific behaviour probes).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `results`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `results`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `results`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `results` (WebKit recent-search count).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `results`.
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
 *    — none of them currently cover `results`. A regression that
 *    added `results="5"` (e.g. by mistakenly templating a search-input
 *    attribute onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("results") === false` AND
 * `track.getAttribute("results") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a legacy HTML attribute — `results` with an empty value is still
 * authored, and any string value is a regression. The companion
 * `getAttribute(...) === null` check is the contract DOM consumers
 * rely on when probing for the attribute's value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no results attribute (W3095)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a results attribute", () => {
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

    // The pin: NO results attribute is authored on the chip strip.
    // A regression that adds `results=""`, `results="5"`, or any
    // other WebKit recent-search count binding would fail here.
    expect(track!.hasAttribute("results")).toBe(false);
    expect(track!.getAttribute("results")).toBeNull();
  });
});
