import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3267 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforeunload` attribute.
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
 * `onbeforeunload` is a window-level event handler attribute whose
 * only valid host is the `<body>` element (where it proxies to
 * `window.onbeforeunload`). On a `<div role="tablist">` it is
 * meaningless: no user agent dispatches `beforeunload` events at a
 * div, and authoring the attribute creates a misleading hint to
 * tooling/devtools that the chip rail intercepts navigation. It
 * would be wrong on the chip strip because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it neither initiates nor cancels page navigation,
 *     so there is no `beforeunload` lifecycle to wire up here.
 *  2. The HTML spec only honors `onbeforeunload` as a content
 *     attribute on `<body>` and `<frameset>`; on any other element
 *     it is parsed as an unknown attribute and validators flag it
 *     accordingly, polluting CI accessibility reports.
 *  3. A stray `onbeforeunload="return 'leave?'"` would imply the
 *     filter rail wants to block page exit, confusing static
 *     analyzers (CSP unsafe-inline checks, handler audit tools)
 *     and exfiltrating an unintended unload-confirmation prompt.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onbeforeunload`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onbeforeunload`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onbeforeunload`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of the legacy
 *    `cite` attribute — a different concern (quote source URL).
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCoords, NoMethod, NoAction, NoUsemap,
 *    NoShape, NoCite) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover
 *    `onbeforeunload`. A regression that added
 *    `onbeforeunload="..."` (e.g. by mistakenly templating an
 *    unload-confirmation handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onbeforeunload") === false` AND
 * `track.getAttribute("onbeforeunload") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of an inline event
 * handler attribute — `onbeforeunload=""` with an empty value is
 * still authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforeunload attribute (W3267)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforeunload attribute", () => {
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

    // The pin: NO onbeforeunload attribute is authored on the chip
    // strip. A regression that adds `onbeforeunload=""`,
    // `onbeforeunload="return 'leave?'"`, or any other unload
    // handler binding would fail here.
    expect(track!.hasAttribute("onbeforeunload")).toBe(false);
    expect(track!.getAttribute("onbeforeunload")).toBeNull();
  });
});
