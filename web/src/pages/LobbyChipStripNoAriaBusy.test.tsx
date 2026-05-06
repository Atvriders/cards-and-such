import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2767 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-busy` attribute.
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
 * The category filter strip is a static, fully-rendered control —
 * its children (the per-category chips) are derived synchronously
 * from the in-memory game catalogue at render time. There is no
 * async fetch, no streaming hydration, and no skeleton-vs-real
 * swap on the chip rail itself. An `aria-busy` attribute would
 * lie to assistive tech: `aria-busy="true"` would suppress live
 * announcements of chip state under the assumption that the
 * region is mid-update, and `aria-busy="false"` would be redundant
 * vs the implicit default.
 *
 * Note that `aria-busy="true"` IS legitimately used elsewhere in
 * LobbyPage — the skeleton placeholder grid (`lobby-skeleton-grid`)
 * carries it during the initial render, as documented by sibling
 * pins LobbyGridNoRole / LobbyGridNoStyle. That makes it
 * particularly important to pin its ABSENCE on the chip strip:
 * a future refactor that generalised "loading" state from the
 * grid up to a parent container could plausibly sprinkle
 * `aria-busy` onto the chip rail too, with no other test failing.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-busy`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-busy`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-busy` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on the same element — orthogonal to
 *    `aria-busy`.
 *  - None of the existing pins would catch a regression that added
 *    `aria-busy="true"` (or `="false"`) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-busy") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether to fall back to the role's default busy semantics.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-busy attribute (W2767)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-busy attribute", () => {
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

    // The pin: NO aria-busy attribute is authored on the chip strip.
    // A regression that adds `aria-busy="true"` (semantically
    // claiming the rail is mid-load and suppressing AT updates) or
    // even `aria-busy="false"` (redundant noise vs the role default)
    // would fail here.
    expect(track!.hasAttribute("aria-busy")).toBe(false);
  });
});
