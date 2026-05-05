import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1843 — pin the EXACT direct-child cardinality on every solo-card
 * tile's `.tile-chips` wrapper.
 *
 * `TileMetaChips` (LobbyPage.tsx ~L2728-2759) renders its container
 * `<div className="tile-chips">` with EXACTLY 2 direct element
 * children:
 *   1. the eta pill   — `<span class="tile-chip tile-chip-eta">`     (~L2735-2742)
 *   2. the diff pill  — `<span class="tile-chip tile-chip-diff-…">`  (~L2743-2756)
 *
 * Sibling tests pin OTHER attributes of this same wrapper / its
 * children, but NONE pin the wrapper's `childElementCount`:
 *
 *   - W1397 (LobbyTileChipsAria.test.tsx)        : aria-hidden="false" on the wrapper.
 *   - W1692 (LobbyTileChipsClassEq.test.tsx)     : className === "tile-chips" equality.
 *   - W…    (LobbyTileEtaTag.test.tsx)           : the eta pill's tag/class.
 *   - W…    (LobbyTileDiffTag.test.tsx)          : the diff pill's tag/class.
 *   - W…    (LobbyTileDiffAria.test.tsx)         : the diff pill's aria-label format.
 *   - W…    (LobbyTileDiffDots.test.tsx)         : the 1-3 dot rendering inside the diff pill.
 *
 * A regression that injected a third sibling — for example a future
 * "rating preview" pill, a new "players" chip, or a stray decorative
 * `<span>` — would still pass every sibling test (the new pill would
 * carry its own className, the existing eta/diff pills' attributes
 * stay intact, and the wrapper's aria-hidden / className don't
 * change). The structural contract that the chips wrapper renders
 * the eta + diff pair AND NOTHING ELSE has no dedicated assertion.
 *
 * Pinning `childElementCount === 2` is the cheapest cross-check:
 * - excludes text / comment nodes, so React whitespace formatting
 *   between siblings doesn't perturb the count;
 * - catches both ADDITIONS (a new sibling pill) and REMOVALS (e.g.
 *   collapsing the diff dots branch into the eta span).
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1397 / W1692 / the rest of the Lobby tile-chips
 * siblings: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chips wrapper childElementCount=2 (W1843)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-chips wrapper with exactly 2 direct element children", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every chips wrapper. We use the EXACT class equality match
    // (already pinned by W1692) to avoid the inner `.tile-chip*` pills
    // and the `.tile-chips-row` family-card variant container
    // (LobbyPage.tsx ~L3271, a different surface with its own children).
    const wrappers = Array.from(
      document.querySelectorAll<HTMLElement>("div.tile-chips"),
    ).filter((el) => el.className === "tile-chips");

    expect(wrappers.length).toBeGreaterThan(0);

    for (const wrapper of wrappers) {
      // The structural contract: exactly the eta pill + the diff pill,
      // and NOTHING ELSE. `childElementCount` excludes text/comment
      // nodes so React's inter-element whitespace doesn't matter.
      expect(wrapper.childElementCount).toBe(2);

      // Cross-check: the two direct children are exactly the eta +
      // diff spans, so the count can't accidentally pass via two
      // unrelated siblings (e.g. if a future regression dropped the
      // eta span and added two stray decorative spans).
      const directChildren = Array.from(wrapper.children);
      expect(directChildren).toHaveLength(2);
      expect(directChildren[0].className).toContain("tile-chip-eta");
      expect(directChildren[1].className).toContain("tile-chip-diff");
    }
  });
});
