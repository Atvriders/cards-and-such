import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3282 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmessage` attribute.
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
 * `onmessage` is a global event handler attribute whose only valid
 * hosts are `<body>` (mapped to `window.onmessage`) and `<frameset>` —
 * where it fires when the window receives a `MessageEvent` via
 * `postMessage`. On a `<div role="tablist">` it is meaningless: no
 * user agent dispatches `MessageEvent`s at arbitrary divs, and the
 * HTML spec does not treat `onmessage` as a content attribute on
 * generic elements. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither the window proxy (`<body>`) nor a
 *     `<frameset>`, so `MessageEvent`s simply do not propagate to it.
 *  2. A stray `onmessage="..."` inline handler is a classic XSS sink
 *     — even though it would never fire on a `<div>`, its presence in
 *     the DOM string is flagged by CSP/inline-handler auditors and by
 *     security scanners (e.g. axe, ESLint react/no-unknown-property,
 *     html-validate).
 *  3. A `cross-origin postMessage` listener wired into the DOM via an
 *     attribute (rather than `window.addEventListener("message", ...)`)
 *     would imply this div is a message-event sink, confusing tooling
 *     that introspects message-bus topology (e.g. iframe-bridge
 *     scanners, sandboxed-postMessage validators).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onmessage`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onmessage`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `onmessage`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` —
 *    different legacy HTML attribute, silent on `onmessage`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` —
 *    legacy quote-source attribute, silent on `onmessage`.
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
 *    — none of them currently cover `onmessage`. A regression that
 *    added `onmessage="..."` (e.g. by mistakenly templating a
 *    body-style postMessage handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onmessage") === false` plus the
 * complementary `track.getAttribute("onmessage") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an event-handler content attribute — `onmessage=""` with an empty
 * value is still authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmessage attribute (W3282)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmessage attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
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

    // The pin: NO onmessage attribute is authored on the chip strip.
    // A regression that adds `onmessage=""`, `onmessage="handler()"`,
    // or any other postMessage-event handler binding would fail here.
    expect(track!.hasAttribute("onmessage")).toBe(false);
    expect(track!.getAttribute("onmessage")).toBeNull();
  });
});
