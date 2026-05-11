import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3207 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerdown` attribute.
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
 * `onpointerdown` is an inline event-handler content attribute that,
 * when authored on an HTML element, instructs the user agent to parse
 * its string value as JavaScript and execute it when a pointer device
 * (mouse, touch, pen) is pressed against the element. On a
 * `<div role="tablist">` chip strip it is unequivocally wrong because:
 *  1. Inline event-handler attributes (`on*=`) are a well-known
 *     anti-pattern in modern React/TSX codebases — every interactive
 *     behavior should be wired via JSX `onPointerDown={fn}` props,
 *     which React reconciles through its synthetic-event system and
 *     properly tears down on unmount. A raw `onpointerdown="..."`
 *     content attribute lives outside React's lifecycle, will not be
 *     garbage-collected when the component unmounts, and bypasses any
 *     React event delegation or capture-phase ordering guarantees.
 *  2. Inline `on*` handlers are the canonical XSS sink — strict
 *     Content-Security-Policy headers (`script-src` without
 *     `'unsafe-inline'`) block them by design, so an authored
 *     `onpointerdown="..."` would either silently fail under CSP or
 *     force the deployment to weaken its CSP, regressing the site's
 *     security posture.
 *  3. Validators and linters (eslint-plugin-react, html-validate,
 *     biome's `noNoninteractiveTabindex` family) flag inline event
 *     handlers as authoring smells. axe and other a11y scanners do
 *     not directly fail on `onpointerdown`, but the surrounding
 *     `role="tablist"` contract expects keyboard-driven activation
 *     via `onKeyDown` / `onClick` on the children, not a
 *     container-level pointer hook bypassing semantics.
 *  4. The chip strip's pointer interactions (drag-to-scroll,
 *     wheel-pan) are intentionally wired via React refs and
 *     `addEventListener` inside `useEffect`, not via JSX event props
 *     and certainly not via inline content attributes. The pin
 *     defends that architectural choice — any regression that
 *     authored an inline `onpointerdown="..."` on the track itself
 *     would indicate someone bypassing the ref-based listener wiring.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — silent on the inner track's
 *    inline-handler attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onpointerdown`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onpointerdown`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — different attribute family.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` (legacy
 *    image-map hotspot attribute) — orthogonal to `onpointerdown`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` (legacy
 *    quote-source URL attribute) — orthogonal to inline handlers.
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
 *    NoCite) each pin one specific global/legacy/event-handler
 *    attribute's absence — none of them currently cover
 *    `onpointerdown`. A regression that added
 *    `onpointerdown="..."` (e.g. by mistakenly templating an inline
 *    pointer handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onpointerdown") === false` AND
 * `track.getAttribute("onpointerdown") === null`. Both primitives are
 * checked because `hasAttribute` returns `false` for any unauthored
 * attribute name, while `getAttribute` returns `null` — together they
 * defend against both the empty-value (`onpointerdown=""`) and the
 * string-value (`onpointerdown="doThing()"`) regression shapes.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerdown attribute (W3207)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerdown attribute", () => {
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

    // The pin: NO onpointerdown attribute is authored on the chip
    // strip. A regression that adds `onpointerdown=""`,
    // `onpointerdown="doThing()"`, or any other inline pointer-press
    // event-handler binding would fail here.
    expect(track!.hasAttribute("onpointerdown")).toBe(false);
    expect(track!.getAttribute("onpointerdown")).toBeNull();
  });
});
