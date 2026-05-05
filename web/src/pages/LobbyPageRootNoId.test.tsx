import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2091 — the OUTER `<div class="lobby-page">` element that wraps the
 * entire lobby (drawer + main content) intentionally carries NO `id`
 * attribute. The wrapper is resolved by callers/CSS exclusively via
 * its `lobby-page` className (and the `lobby-page--drawer-collapsed`
 * modifier pinned by W1179); nothing in the page (or its CSS / aria-*
 * relations) targets this wrapper by `#id`.
 *
 * Why this needs its own pin:
 *  - Sibling pins on the same outer element cover the attributes that
 *    DO appear (W1179 / LobbyDrawerOuterClass — the
 *    `lobby-page--drawer-collapsed` modifier toggle), but none assert
 *    the ABSENCE of an `id`. A drive-by refactor that adds e.g.
 *    `id="lobby-page"` for a future aria-controls / scroll-anchor /
 *    skip-link relation would silently change the public DOM contract
 *    of the lobby's top-level wrapper — duplicate ids elsewhere
 *    (other route wrappers reusing the same id, future inner panels)
 *    would then produce invalid HTML without any test failing.
 *  - Mirrors the established W1856/LobbyChipStripNoId,
 *    W2043/LobbyToolbarNoId, and *.NoId.test.tsx family pattern: pin
 *    the "no id" invariant at the same granularity as the "has X"
 *    invariants on the same element.
 *
 * Lives in a NEW SIBLING file (not appended to LobbyPage.test.tsx) to
 * follow the established convention in this directory and keep the
 * assertion under the `src/pages/Lobby` vitest filter without
 * colliding with concurrent test additions.
 */
describe("LobbyPage — outer page-root wrapper has no id attribute (W2091)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render an id attribute on the .lobby-page outer wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor via a stable child testid that is rendered at every
    // viewport width (the drawer is desktop-only, so we use the
    // always-present `lobby-total-count` instead), then walk up to
    // the closest `.lobby-page` wrapper. This keeps the lookup
    // independent of the attribute under inspection — we cannot use
    // an id-based query for obvious reasons, and the wrapper has no
    // testid of its own by design.
    const anchor = screen.getByTestId("lobby-total-count");
    const root = anchor.closest(".lobby-page") as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) return;

    // Sanity: we resolved the right element before pinning the
    // negative invariant.
    expect(root.classList.contains("lobby-page")).toBe(true);

    // Pin the literal absence. `hasAttribute` (rather than reading
    // `.id`, which always returns "" for missing ids) distinguishes
    // "no attribute rendered" from "attribute rendered as empty".
    expect(root.hasAttribute("id")).toBe(false);
  });
});
