import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3077 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `standby` attribute.
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
 * `standby` is a legacy HTML attribute whose only valid host was
 * `<object>` — where it carried a short message displayed by the user
 * agent while the embedded object was loading. The attribute was
 * deprecated in HTML5 and removed entirely from the HTML Living
 * Standard. On a `<div role="tablist">` it is meaningless: no user
 * agent, no screen reader, and no spec consumer interprets `standby`
 * on a non-`<object>` element. Authoring it on the chip strip would
 * be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an `<object>` embed nor a loading
 *     placeholder, so there is no "loading…" message to surface.
 *  2. Validators (W3C Nu, html-validate, axe) flag `standby` on
 *     non-`<object>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `standby="Loading filters…"` would imply the filter rail
 *     is an in-progress object load, confusing tooling that
 *     introspects DOM provenance (e.g. progressive-rendering trackers,
 *     embed-status crawlers, legacy-HTML linters).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `standby`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `standby`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `standby`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `standby` (object loading message).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `standby`.
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
 *    — none of them currently cover `standby`. A regression that
 *    added `standby="Loading…"` (e.g. by mistakenly templating an
 *    object-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("standby") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `standby` with an empty value is still authored, and
 * any string value is a regression. We assert both forms for
 * defence-in-depth.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no standby attribute (W3077)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a standby attribute", () => {
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

    // The pin: NO standby attribute is authored on the chip strip.
    // A regression that adds `standby=""`, `standby="Loading…"`,
    // or any other object-loading message would fail here.
    expect(track!.hasAttribute("standby")).toBe(false);
    expect(track!.getAttribute("standby")).toBeNull();
  });
});
