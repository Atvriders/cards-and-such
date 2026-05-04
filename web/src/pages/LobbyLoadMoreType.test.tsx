import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";

/**
 * W1253 — the lobby's infinite-scroll fallback "Load more" button is
 * rendered with an explicit `type="button"` attribute.
 *
 * The distinction matters even though no surrounding <form> exists
 * today: a default `<button>` element resolves to `type="submit"`,
 * which means dropping a load-more button into any future form
 * wrapper (e.g. an enclosing search/filter form) would silently
 * trigger form submission on every click. Pinning the attribute
 * documents the safe-by-default intent and catches a regression
 * where the attribute is omitted during a refactor.
 *
 * Existing load-more coverage:
 *   - W1213 (LobbyLoadMoreClick.test.tsx) — clicking grows the
 *     loaded-count caption by PAGE_SIZE; asserts tagName="BUTTON"
 *     and the visible label shape, but NOT the `type` attribute.
 *   - W1228 (LobbyLoadMoreEnd.test.tsx) — clicking until exhausted
 *     unmounts the button + sentinel wrapper.
 * Neither file (nor any other Lobby* test) inspects the raw `type`
 * attribute on `lobby-load-more`, so a regression that drops the
 * explicit `type="button"` would slip through every existing test.
 *
 * Sibling-file placement mirrors the W1213/W1228 pattern so this
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to LobbyPage.tsx or its tests.
 */
describe("LobbyPage — load-more button type attribute (W1253)", () => {
  beforeEach(() => {
    localStorage.clear();
    // The load-more branch only renders in infinite-scroll mode; the
    // pagination default uses Prev/Next instead.
    localStorage.setItem("cards-lobby-list-mode", "infinite");
  });

  it('renders lobby-load-more with explicit type="button"', () => {
    // The button is gated by `hasMore = visibleCount < filtered.length`
    // — only meaningful when the registry exceeds PAGE_SIZE (80).
    expect(GAMES.length).toBeGreaterThan(80);

    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = getByTestId("lobby-load-more") as HTMLButtonElement;

    // Use getAttribute so an omitted attribute returns null rather
    // than the DOM-reflected default of "submit" — this distinguishes
    // an explicit `type="button"` from the implicit fallback.
    expect(btn.getAttribute("type")).toBe("button");
    // Cross-check via the reflected property to catch a malformed
    // attribute value (e.g. type="Button" or type=" button ") that
    // would still pass getAttribute but coerce to "submit" at runtime.
    expect(btn.type).toBe("button");
  });
});
