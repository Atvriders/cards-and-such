import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1222 — the "Surprise me" tile in the hero stats row renders TWO
 * visible labels alongside its decorative dice glyph:
 *   - a `.lobby-stat-count` reading "Lucky" (mirrors the numeric
 *     count slot used by the per-category stat tiles)
 *   - a `.lobby-stat-label` reading "Surprise me" (mirrors the
 *     descriptive label slot used by the per-category stat tiles)
 *
 * Why this needs its own pin:
 *  - Existing Lobby coverage asserts the button's accessible name
 *    ("Open a random game") and its click → /play/<id> behaviour
 *    (W579, W1165) — but no test pins the *visible* text inside the
 *    button. A regression that swaps "Lucky" → "Random" or drops
 *    "Surprise me" would slip through silently because the
 *    aria-label and click handler would still pass.
 *  - The two text spans share the same className shape as the
 *    per-category stats (`lobby-stat-count` + `lobby-stat-label`),
 *    which is intentional so the surprise tile aligns visually with
 *    its siblings — pinning both literal strings guards the visual
 *    parallelism a quick refactor could erode.
 *
 * Sibling-file placement keeps the test under the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to LobbyPage.test.tsx.
 */
describe("LobbyPage — surprise-me visible labels (W1222)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders 'Lucky' count and 'Surprise me' label inside lobby-surprise", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the button via its stable testid so the lookup is
    // independent of the visible text we are about to assert on.
    const btn = screen.getByTestId("lobby-surprise");

    const count = btn.querySelector<HTMLElement>(".lobby-stat-count");
    const label = btn.querySelector<HTMLElement>(".lobby-stat-label");

    expect(count).not.toBeNull();
    expect(label).not.toBeNull();

    // Pin the literal text content so a rename of either span is
    // caught immediately.
    expect(count!.textContent).toBe("Lucky");
    expect(label!.textContent).toBe("Surprise me");
  });
});
