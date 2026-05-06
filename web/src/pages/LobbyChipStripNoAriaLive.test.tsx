import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2825 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx)
 * carries NO `aria-live` attribute.
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
 * The category filter strip is a static, fully-rendered tablist —
 * its children (the per-category chips) are derived synchronously
 * from the in-memory game catalogue at render time. There is no
 * streaming announcement, no toast pipeline, and no rolling status
 * text inside the strip. An `aria-live` attribute would mis-classify
 * the rail as a live region: AT would re-announce the entire chip
 * inventory whenever pressed/selected state flipped on any child,
 * producing an avalanche of speech for what is semantically a
 * tablist with first-class `role="tab"` children that already carry
 * their own `aria-selected` / `aria-pressed` accessibility wiring.
 *
 * Live-region semantics belong on the *result* surface (the count
 * status / pager status / search-results status) — not on the
 * filter control itself. Adding `aria-live="polite"` (or `"assertive"`)
 * to the chip strip would conflict with the tablist role's
 * established UX contract and would be picked up by screen readers
 * such as NVDA and VoiceOver as a noisy, auto-announcing region.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-live`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-live`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on the same element — orthogonal to
 *    `aria-live`.
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy`
 *    on the same element — semantically related but a distinct
 *    attribute; `aria-busy` controls suppression of updates while
 *    `aria-live` controls broadcast politeness, and AT honours each
 *    independently.
 *  - The various `LobbyChipStripNoAria*` sibling pins
 *    (NoAriaChecked, NoAriaControls, NoAriaCurrent, NoAriaDescribedBy,
 *    NoAriaDisabled, NoAriaExpanded, NoAriaHaspopup, NoAriaKeyshortcuts,
 *    NoAriaModal, NoAriaOrientation, NoAriaPressed, NoAriaReadonly,
 *    NoAriaRequired, NoAriaRoleDescription, NoAriaSelected) each
 *    cover their own attribute name — none of them assert
 *    `aria-live`.
 *  - The pager status pin (W: LobbyPagerStatusLive) confirms that
 *    `aria-live` IS legitimately used elsewhere in the lobby tree,
 *    making it especially important to pin its ABSENCE here so a
 *    future refactor that generalised live-region behaviour from the
 *    pager up to a shared region can not silently leak the attribute
 *    onto the chip filter rail.
 *
 * The pin: `track.hasAttribute("aria-live") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether the element is a live region at all.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-live attribute (W2825)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-live attribute", () => {
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

    // The pin: NO aria-live attribute is authored on the chip strip.
    // A regression that adds `aria-live="polite"` (turning the
    // tablist into a chatty live region that re-announces on every
    // selection flip) or `aria-live="assertive"` (interrupt-priority
    // announcements on a static filter rail) or even
    // `aria-live="off"` (redundant noise vs the role default) would
    // fail here.
    expect(track!.hasAttribute("aria-live")).toBe(false);
  });
});
