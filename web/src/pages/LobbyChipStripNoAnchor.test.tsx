import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2852 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `anchor` attribute.
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
 * `anchor` is a CSS Anchor Positioning attribute (CSS Anchor
 * Positioning Module Level 1, currently shipping in Chromium 125+).
 * When set on an element, it declares an implicit anchor name that
 * other elements with `position-anchor: <name>` (or the legacy
 * `anchor()` `tether-element` syntax) can target as a positioning
 * anchor. The chip-strip tablist track is NOT intended to participate
 * in CSS anchor positioning — it is a horizontally-scrolling
 * `role="tablist"` rail with arrow controls (`.lobby-chips-arrow--left`
 * and `.lobby-chips-arrow--right`) handled via overflow detection on
 * the wrapper, NOT via anchored positioning. Adding an `anchor`
 * attribute would falsely register the rail as a CSS anchor target,
 * potentially causing other anchor-positioned popovers / tooltips
 * elsewhere on the page to (unexpectedly) attach to the chip strip
 * if they share an `anchor-name`.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its `anchor` attribute.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on `anchor`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `anchor`.
 *  - The LobbyChipStripNoAria* family (NoAriaAtomic, NoAriaBusy,
 *    NoAriaChecked, NoAriaControls, NoAriaCurrent, NoAriaDescribedBy,
 *    NoAriaDisabled, NoAriaExpanded, NoAriaHaspopup,
 *    NoAriaKeyshortcuts, NoAriaLive, NoAriaModal, NoAriaOrientation,
 *    NoAriaPressed, NoAriaReadonly, NoAriaRelevant, NoAriaRequired,
 *    NoAriaRoleDescription, NoAriaSelected) each pin a DIFFERENT
 *    specific ARIA attribute's absence — none cover the
 *    CSS-anchor-positioning `anchor` attribute, which is not an ARIA
 *    attribute at all.
 *  - The LobbyChipStripNo* HTML-attribute family (NoAutocapitalize,
 *    NoAutocomplete, NoAutofocus, NoContenteditable, NoDir, NoForm,
 *    NoHidden, NoId, NoInert, NoInputmode, NoLang, NoName,
 *    NoSpellcheck, NoStyle, NoTabindex, NoTranslate, NoValue) each
 *    pin a DIFFERENT specific HTML attribute's absence — none cover
 *    `anchor`.
 *  - None of the existing pins would catch a regression that added
 *    `anchor="..."` to the inner `<div class="lobby-chips"
 *    role="tablist">`.
 *
 * The pin: `track.hasAttribute("anchor") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor CSS-Anchor-Positioning tooling and DOM introspection
 * libraries actually use to decide whether an implicit anchor name
 * is registered.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other attribute of the element under test.
 */
describe("LobbyPage — .lobby-chips tablist has no anchor attribute (W2852)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an anchor attribute", () => {
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

    // The pin: NO `anchor` attribute is authored on the chip strip.
    // A regression that added `anchor="..."` (registering the rail
    // as an implicit CSS-Anchor-Positioning target that other
    // anchored elements could tether to via `position-anchor`)
    // would fail here.
    expect(track!.hasAttribute("anchor")).toBe(false);
  });
});
