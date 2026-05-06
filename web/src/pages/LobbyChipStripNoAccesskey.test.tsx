import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2880 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `accesskey` attribute.
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
 * `accesskey` is a global HTML content attribute that exposes a
 * browser-level keyboard shortcut (Alt+key / Ctrl+Opt+key depending
 * on the user agent) for focusing/activating an element. Authoring
 * it on the chip-strip tablist container would be wrong because:
 *  1. The tablist `<div>` is not natively focusable; per-chip focus
 *     is handled via roving tabindex on the individual `role="tab"`
 *     chip buttons. An `accesskey` on the container has no
 *     meaningful target.
 *  2. `accesskey` collisions with existing user-agent, OS, and
 *     assistive-technology shortcuts are notoriously hostile — the
 *     filter rail must not silently steal a keyboard combination
 *     from the user.
 *  3. Discoverability of `accesskey` shortcuts is poor (no visible
 *     affordance), so the chip strip's own visible keyboard help
 *     (kbd-tip) is the canonical and only shortcut surface.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its global HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `accesskey`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `accesskey`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `accesskey`.
 *  - W2804 (LobbyChipStripNoAutofocus) pins absence of `autofocus`
 *    on the same element — orthogonal to `accesskey`.
 *  - The numerous sibling LobbyChipStripNo* pins (NoTabindex,
 *    NoLang, NoDir, NoId, NoStyle, NoForm, NoName, NoValue,
 *    NoSlot, NoPart, NoIs, NoNonce, NoHidden, NoInert,
 *    NoSpellcheck, NoTranslate, NoContenteditable, NoAutocomplete,
 *    NoAutocapitalize, NoInputmode, etc.) each pin one specific
 *    global/legacy attribute's absence — none of them currently
 *    cover `accesskey`. A regression that added `accesskey="f"`
 *    (e.g. for "filter") would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("accesskey") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a global HTML
 * attribute — `accesskey` with an empty value is still authored,
 * and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no accesskey attribute (W2880)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an accesskey attribute", () => {
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

    // The pin: NO accesskey attribute is authored on the chip strip.
    // A regression that adds `accesskey=""`, `accesskey="f"`, or any
    // other shortcut binding would fail here.
    expect(track!.hasAttribute("accesskey")).toBe(false);
  });
});
