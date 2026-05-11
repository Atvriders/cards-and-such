import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3151 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onclick` HTML attribute.
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
 * Important distinction: this pin is about the literal HTML `onclick`
 * attribute on the DOM node — NOT about React's synthetic `onClick`
 * prop. React's synthetic event delegation never serializes
 * `onClick={fn}` to a DOM `onclick` attribute; the handler is attached
 * via React's root-level event listener and the rendered DOM node
 * carries no `onclick=` text. The presence of `onclick` as a literal
 * HTML attribute would therefore indicate that:
 *  1. Someone authored raw inline HTML containing an `onclick="..."`
 *     event handler string (XSS-adjacent — inline event handlers are
 *     blocked by strict CSP `script-src` directives that omit
 *     `'unsafe-inline'`).
 *  2. Someone called `track.setAttribute("onclick", "...")` imperatively
 *     to bypass React's synthetic event system.
 *  3. A server-side template (SSR/SSG) injected a stringified handler
 *     into the markup.
 *
 * Any of these would be a regression because:
 *  - Inline `onclick="..."` is a CSP violation under strict policies
 *    and breaks the chip strip in production (handler never fires).
 *  - It bypasses React's reconciliation — the handler will not be
 *    cleaned up on unmount, leaking memory and firing on stale state.
 *  - It is a vector for stored-XSS if any portion of the attribute is
 *    interpolated from user input.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    quote-source attribute, orthogonal to event handlers.
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div tagName + className — it does not introspect inner attrs.
 *  - W1330 / W1331 (LobbyChipStripAria*) pin `role` and `aria-label`
 *    — silent on event-handler attributes.
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
 *    — none of them currently cover `onclick`. A regression that
 *    added a literal `onclick="..."` attribute (e.g. via raw HTML
 *    interpolation or imperative `setAttribute`) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onclick") === false` AND
 * `track.getAttribute("onclick") === null`. We check both forms
 * because they are subtly different:
 *  - `hasAttribute` is the canonical primitive for asserting absence
 *    — even `onclick=""` (empty string value) is still authored.
 *  - `getAttribute(...) === null` is the value-side dual — returning
 *    null only when the attribute is fully absent.
 *
 * Reminder: this pin DOES NOT assert that the chip strip has no
 * React `onClick` prop. React's `onClick={...}` is synthetic and is
 * attached via root-level delegation; the rendered DOM node never
 * carries an `onclick=` attribute string regardless of whether
 * `onClick` is passed. This pin is specifically about the literal
 * HTML attribute being absent from the serialized DOM.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onclick attribute (W3151)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onclick HTML attribute", () => {
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

    // The pin: NO literal `onclick` HTML attribute is authored on the
    // chip strip. React's synthetic onClick prop does NOT serialize
    // to a DOM `onclick` attribute, so this assertion is silent on
    // React handlers and only fires on raw HTML / imperative
    // setAttribute regressions.
    expect(track!.hasAttribute("onclick")).toBe(false);
    expect(track!.getAttribute("onclick")).toBeNull();
  });
});
