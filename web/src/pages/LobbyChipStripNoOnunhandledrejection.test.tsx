import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3297 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onunhandledrejection` attribute.
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
 * `onunhandledrejection` is a `WindowEventHandlers` global event
 * handler IDL attribute — its only valid host in the HTML spec is the
 * `<body>` element (where it mirrors `window.onunhandledrejection` and
 * fires when a Promise rejection is not handled). On a `<div
 * role="tablist">` it is meaningless: the HTML parser ignores it (the
 * IDL attribute is only reflected on `HTMLBodyElement`), no user
 * agent wires it up as an event listener on a `<div>`, and no
 * accessibility / validator tooling treats it as a valid attribute
 * outside `<body>`. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no relationship to Promise rejection plumbing,
 *     which is a `Window` / `WorkerGlobalScope`-level concern.
 *  2. Validators (W3C Nu, html-validate, axe) flag
 *     `onunhandledrejection` on non-`<body>` elements as an unknown
 *     event-handler attribute, polluting CI accessibility reports.
 *  3. A stray `onunhandledrejection="..."` would imply the filter rail
 *     wants to intercept window-level unhandled Promise rejections,
 *     confusing tooling that introspects DOM event-handler surface
 *     (e.g. CSP inline-handler scanners, security linters, error
 *     telemetry shims that walk the tree looking for inline handlers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its global event handler IDL
 *    attribute surface.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onunhandledrejection`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onunhandledrejection`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onunhandledrejection`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy HTML attribute, not a `WindowEventHandlers` event handler.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a quote
 *    source URL attribute, not a Promise-rejection handler.
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
 *    NoAriaSelected, NoCoords, NoCite, NoMethod, NoAction, NoUsemap,
 *    NoShape) each pin one specific global/legacy attribute's absence
 *    — none of them currently cover `onunhandledrejection`. A
 *    regression that added `onunhandledrejection="..."` (e.g. by
 *    mistakenly templating a body-level error handler onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onunhandledrejection") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null` alone) is
 * the canonical primitive for asserting absence of an event-handler
 * IDL attribute — `onunhandledrejection` with an empty value is still
 * authored, and any string value is a regression. We pair it with
 * `getAttribute("onunhandledrejection") === null` for defense in
 * depth.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onunhandledrejection attribute (W3297)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onunhandledrejection attribute", () => {
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

    // The pin: NO onunhandledrejection attribute is authored on the
    // chip strip. A regression that adds `onunhandledrejection=""`,
    // `onunhandledrejection="handler()"`, or any other Promise
    // rejection handler binding would fail here.
    expect(track!.hasAttribute("onunhandledrejection")).toBe(false);
    expect(track!.getAttribute("onunhandledrejection")).toBe(null);
  });
});
