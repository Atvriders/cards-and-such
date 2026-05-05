import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2208 — the per-tile footer wrapper (`.tile-foot`) MUST NOT carry an
 * `aria-hidden` attribute. The footer is the `<div className="tile-foot">`
 * rendered inside each lobby tile (see LobbyPage.tsx around line 2067)
 * holding the player-count text and the "Play" CTA span:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * The DECORATIVE child (`.tile-cta` "Play" glyph) is intentionally
 * `aria-hidden="true"` so screen readers don't announce the duplicate
 * "Play" word — the surrounding `<Link>` already exposes the game
 * title as its accessible name. However, the `.tile-foot` wrapper
 * itself MUST remain visible to assistive tech: it contains the
 * `.tile-players` text ("2 players", "2–4 players", etc.) which is
 * meaningful, non-decorative content that screen-reader users rely
 * on to choose a game.
 *
 * Sibling pins already cover other aspects of this footer:
 *   - LobbyTileFootClass.test.tsx pins the `.tile-foot` className (W1473).
 *   - LobbyTileFootClassEq.test.tsx pins exact className equality.
 *   - LobbyTileFootNoId.test.tsx pins the absence of an `id`.
 *   - LobbyTileFootNoStyle.test.tsx pins the absence of inline `style` (W2101).
 *
 * What none of those cover is the ABSENCE of an `aria-hidden` attribute on
 * the tile-foot wrapper itself. A naive future refactor that propagated
 * `aria-hidden="true"` from the inner `.tile-cta` glyph onto the wrapper
 * (e.g. "the whole footer is decorative") would silently hide the
 * `.tile-players` count from screen readers — a real accessibility
 * regression that no other pin would catch. Conversely, adding
 * `aria-hidden="false"` would be redundant noise. Either change should
 * be deliberate; this pin makes the contract explicit.
 *
 * One focused assertion: the first rendered `.tile-foot` wrapper MUST
 * NOT carry an `aria-hidden` attribute (presence check, regardless of
 * value).
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established LobbyTileFoot* pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-foot wrapper has no aria-hidden attribute (W2208)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-foot wrapper does NOT carry an aria-hidden attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector returns the first
    // match, which is sufficient for this single-attribute pin and
    // avoids coupling to the (separately-pinned) total tile count.
    const foot = document.querySelector<HTMLElement>(".tile-foot");
    expect(foot).not.toBeNull();

    // Sanity: confirm we pinned the footer wrapper itself and not, say,
    // a child span. Without this guard a future restructure that moved
    // the className onto a different element could pass vacuously.
    expect(foot!.tagName).toBe("DIV");

    // The actual contract: no `aria-hidden` attribute on the tile-foot
    // wrapper. Use `hasAttribute` so we catch both `aria-hidden="true"`
    // and `aria-hidden="false"` (the latter is redundant noise) — only
    // the absence of the attribute is correct here.
    expect(foot!.hasAttribute("aria-hidden")).toBe(false);
  });
});
