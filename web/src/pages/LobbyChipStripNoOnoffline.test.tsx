import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3288 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onoffline` attribute.
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
 * `onoffline` is a legacy global event-handler content attribute whose
 * only valid host is the `<body>` element — it fires on `window` when
 * the browser transitions to offline mode (the `offline` event of the
 * `WindowEventHandlers` mixin). On a `<div role="tablist">` it is
 * meaningless: the spec routes the `offline` event to the Window
 * object, not arbitrary descendants, so no user agent will ever
 * dispatch an `offline` event at the chip-strip track. Authoring it
 * on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body, and the WindowEventHandlers
 *     mixin does not apply, so the handler is dead code.
 *  2. Inline `onX=` attributes are CSP-hostile: any project with a
 *     `script-src` policy that omits `'unsafe-inline'` (the default in
 *     modern hardened deployments) will block the handler and emit
 *     a console violation, polluting CI noise.
 *  3. A stray `onoffline="..."` would imply the filter rail listens
 *     for connectivity changes, confusing tooling that introspects
 *     DOM event-handler provenance (security scanners, a11y auditors,
 *     and React's own dev-mode prop validator which warns on unknown
 *     DOM attributes).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onoffline`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onoffline`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `onoffline`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL).
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCite, NoCoords, NoMethod, NoAction,
 *    NoUsemap, NoShape)
 *    each pin one specific global/legacy attribute's absence — none
 *    of them currently cover `onoffline`. A regression that added
 *    `onoffline="navigator.serviceWorker..."` (e.g. by mistakenly
 *    templating a connectivity handler onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("onoffline") === false` AND
 * `track.getAttribute("onoffline") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * event-handler attribute — `onoffline` with an empty value is still
 * authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onoffline attribute (W3288)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onoffline attribute", () => {
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

    // The pin: NO onoffline attribute is authored on the chip strip.
    // A regression that adds `onoffline=""`, `onoffline="..."`,
    // or any other connectivity-handler binding would fail here.
    expect(track!.hasAttribute("onoffline")).toBe(false);
    expect(track!.getAttribute("onoffline")).toBeNull();
  });
});
