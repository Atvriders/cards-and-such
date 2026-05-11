import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3279 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onstorage` attribute.
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
 * `onstorage` is a legacy HTML event-handler content attribute whose
 * only valid host is the `<body>` element — where it is a shorthand
 * for `window.onstorage` and fires when another browsing context (a
 * different tab/window same-origin) writes to `localStorage` /
 * `sessionStorage`. On a `<div role="tablist">` it is meaningless:
 * the storage event never targets a generic element, no user agent
 * forwards storage events to anything other than `window`, and the
 * inline-handler form on a non-`<body>` element is silently ignored
 * by every browser. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no relationship to cross-tab storage
 *     synchronization. Any storage listening required by the lobby
 *     filter state is owned by React/JS, not by a DOM-level inline
 *     handler.
 *  2. Validators (W3C Nu, html-validate, axe) flag `onstorage` on
 *     non-body elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `onstorage="..."` string would be parsed as inline
 *     JavaScript by some legacy tooling and represents a potential
 *     XSS vector — the chip strip must remain free of inline
 *     event-handler content attributes.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onstorage`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onstorage`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onstorage` (cross-tab storage event handler).
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCite, NoCoords, NoMethod, NoAction,
 *    NoUsemap, NoShape) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover `onstorage`.
 *    A regression that added `onstorage="..."` (e.g. by mistakenly
 *    templating a body-level event handler onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onstorage") === false` and
 * `track.getAttribute("onstorage") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `onstorage` with an empty value is still authored, and
 * any string value is a regression. The `getAttribute(...) === null`
 * check is a belt-and-suspenders confirmation.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onstorage attribute (W3279)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onstorage attribute", () => {
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

    // The pin: NO onstorage attribute is authored on the chip strip.
    // A regression that adds `onstorage=""`, `onstorage="..."`, or
    // any other inline storage-event handler binding would fail here.
    expect(track!.hasAttribute("onstorage")).toBe(false);
    expect(track!.getAttribute("onstorage")).toBeNull();
  });
});
