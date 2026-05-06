import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2804 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx)
 * carries NO `autofocus` attribute.
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
 * `autofocus` is a boolean HTML content attribute that hijacks initial
 * focus on page load. Authoring it on the chip-strip tablist container
 * would be wrong for two reasons:
 *  1. The tablist `<div>` is not a natively focusable element; focus
 *     management for the chip strip is handled per-chip via roving
 *     tabindex on the individual `role="tab"` chips, not on the
 *     container.
 *  2. Even ignoring focusability, hijacking page-load focus to the
 *     filter rail (above the actual game tile grid) would yank the
 *     viewport and screen-reader cursor away from the lobby's primary
 *     content for no user benefit.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its boolean attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `autofocus`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `autofocus`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `autofocus`.
 *  - The per-chip W1xxx (LobbyChipAllNoAutofocus / per-category chip
 *    NoAutofocus pins) all assert absence on the *chip buttons*, not
 *    on the *strip container* itself. None of them would catch a
 *    regression that added `autofocus` to the `.lobby-chips` track.
 *
 * The pin: `track.hasAttribute("autofocus") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* of a boolean HTML
 * attribute — `autofocus` is presence-truthy, so any value (including
 * the empty string) is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no autofocus attribute (W2804)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an autofocus attribute", () => {
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

    // The pin: NO autofocus attribute is authored on the chip strip.
    // A regression that adds `autofocus`, `autofocus=""`, or
    // `autofocus="true"` would fail here.
    expect(track!.hasAttribute("autofocus")).toBe(false);
  });
});
