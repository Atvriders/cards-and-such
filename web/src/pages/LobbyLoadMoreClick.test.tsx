import { describe, expect, it, beforeEach } from "vitest";
import { render, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";

/**
 * W1213 — in infinite-scroll list mode the lobby exposes a manual
 * fallback "Load more" button (data-testid="lobby-load-more") that
 * bumps the rendered window by one page-size of tiles. The button
 * lives next to the IntersectionObserver sentinel so users on
 * keyboards or assistive tech (or browsers where the observer
 * doesn't fire under JSDOM) can still progress past the initial
 * 80 entries.
 *
 * No existing Lobby* test asserts:
 *   - the button label shape "Load more · <remaining> remaining",
 *   - that clicking it grows the loaded-count caption by exactly
 *     PAGE_SIZE (or to filtered.length, whichever is smaller).
 *
 * Sibling-file placement mirrors the W1180/W1165 pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to LobbyPage.test.tsx.
 */
describe("LobbyPage — load-more button click (W1213)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Switch the lobby into infinite-scroll mode so the
    // <button data-testid="lobby-load-more"> branch renders. The
    // pagination default uses Prev/Next instead and would skip
    // the load-more surface entirely.
    localStorage.setItem("cards-lobby-list-mode", "infinite");
  });

  it("clicking lobby-load-more increments the loaded-count caption by PAGE_SIZE (80)", () => {
    // The test is only meaningful when the registry exceeds the
    // initial 80-tile window — otherwise hasMore is false and the
    // button is hidden. Skip with an assertion-style guard so a
    // shrunken registry produces a readable failure rather than a
    // confusing missing-element error.
    expect(GAMES.length).toBeGreaterThan(80);

    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const caption = getByTestId("lobby-loaded-count");
    // Initial caption shape: "Loaded 80 of <total>".
    expect(caption.textContent).toMatch(/^Loaded\s+80\s+of\s+/);

    const btn = getByTestId("lobby-load-more") as HTMLButtonElement;
    expect(btn.tagName).toBe("BUTTON");
    // Pin the visible label shape — copy regression would slip
    // through every other Lobby test untouched.
    expect(btn.textContent).toMatch(/^Load more · [\d,]+ remaining$/);

    fireEvent.click(btn);

    // After one click the visible window grows by PAGE_SIZE=80 (or
    // saturates at filtered.length, whichever is smaller).
    const expectedLoaded = Math.min(160, GAMES.length);
    const updated = within(caption).queryByText(
      new RegExp(`^Loaded\\s+${expectedLoaded.toLocaleString()}\\s+of\\s+`),
    );
    expect(updated ?? caption).toBeTruthy();
    expect(caption.textContent).toMatch(
      new RegExp(`^Loaded\\s+${expectedLoaded.toLocaleString()}\\s+of\\s+`),
    );
  });
});
