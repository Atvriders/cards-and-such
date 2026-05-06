import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2754 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-multiselectable` attribute.
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
 * The category filter strip is a SINGLE-SELECT control (clicking
 * "Cards" replaces the active category — it does not toggle membership
 * in a set). For a `role="tablist"`, ARIA's default selection model
 * is single-select; an explicit `aria-multiselectable="false"` would
 * be redundant, and `aria-multiselectable="true"` would be a hard
 * semantic regression that misleads assistive tech into believing
 * the user can hold multiple categories selected concurrently.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-multiselectable`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-multiselectable`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-multiselectable` state.
 *  - None of the existing pins would catch a regression that added
 *    `aria-multiselectable="true"` (or even `="false"`) to the
 *    inner `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-multiselectable") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether to fall back to the role's default selection model.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-multiselectable attribute (W2754)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-multiselectable attribute", () => {
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

    // The pin: NO aria-multiselectable attribute is authored on the
    // chip strip. A regression that adds `aria-multiselectable="true"`
    // (semantically claiming multi-category selection) or even
    // `aria-multiselectable="false"` (redundant noise vs the role
    // default) would fail here.
    expect(track!.hasAttribute("aria-multiselectable")).toBe(false);
  });
});
