import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3099 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `controlslist` attribute.
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
 * `controlslist` is a media element attribute whose only valid hosts
 * are `<audio>` and `<video>` — where it takes space-separated tokens
 * (`nodownload`, `nofullscreen`, `noremoteplayback`, `noplaybackrate`)
 * that hide specific items from the native media controls UI. On a
 * `<div role="tablist">` it is meaningless: no user agent renders
 * media controls on a div, so there is no native controls UI for
 * `controlslist` to filter. Authoring it on the chip strip would be
 * wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an audio nor a video element, so there
 *     are no native media controls whose items could be hidden.
 *  2. Validators (W3C Nu, html-validate, axe) flag `controlslist` on
 *     non-media elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `controlslist="nodownload nofullscreen"` would imply the
 *     filter rail is a media player, confusing tooling that
 *     introspects DOM provenance (e.g. media scrapers, accessibility
 *     auditors that inspect HTMLMediaElement-specific attributes).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its media attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `controlslist`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `controlslist`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `controlslist`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent on
 *    `controlslist` (media controls filter).
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
 *    NoCite) each pin one specific global/legacy/media attribute's
 *    absence — none of them currently cover `controlslist`. A
 *    regression that added `controlslist="nodownload"` (e.g. by
 *    mistakenly templating a media-element attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("controlslist") === false` AND
 * `track.getAttribute("controlslist") === null`. `hasAttribute` is
 * the canonical primitive for asserting absence of an HTML attribute
 * — `controlslist` with an empty value is still authored, and any
 * string value is a regression. `getAttribute(...) === null` is the
 * complementary check (returns `null` only when the attribute is
 * absent).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no controlslist attribute (W3099)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a controlslist attribute", () => {
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

    // The pin: NO controlslist attribute is authored on the chip strip.
    // A regression that adds `controlslist=""`,
    // `controlslist="nodownload"`, or any other media-controls token
    // binding would fail here.
    expect(track!.hasAttribute("controlslist")).toBe(false);
    expect(track!.getAttribute("controlslist")).toBeNull();
  });
});
