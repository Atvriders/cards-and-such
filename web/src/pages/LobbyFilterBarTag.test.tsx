import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1856 — the lobby toolbar wrapper (the section-level filter/sort/view
 * bar above the lobby grid) is rendered as a plain `<div>`.
 *
 * Why this needs its own pin:
 *  - Sibling pins (LobbyToolbarAria.test.tsx, LobbyToolbarRole.test.tsx)
 *    cover the wrapper's `aria-label` and `role` attributes, but
 *    neither asserts the underlying element type. A refactor that
 *    swapped the host element to a `<nav>`, `<section>`, `<aside>`,
 *    `<header>`, or even a semantic `<menu>` would be silently
 *    accepted today even though it would change the implicit role,
 *    landmark structure, and CSS-cascade assumptions of every
 *    descendant control.
 *  - The wrapper is intentionally a non-landmark `<div>` because it
 *    sits *inside* a `<section aria-label="All games">` already, so
 *    introducing a nested landmark element would over-describe the
 *    region to assistive tech. Pinning the tag makes that contract
 *    explicit at the test layer.
 *
 * Sibling-file placement (rather than extending LobbyToolbarRole.test.tsx
 * or LobbyToolbarAria.test.tsx) keeps each W-numbered invariant in a
 * single-purpose file, mirroring the W1381/W1393 layout so concurrent
 * edits do not collide.
 */
describe("LobbyPage — filter/sort toolbar tagName (W1856)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lobby toolbar wrapper as a <div>", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id so the lookup itself is
    // independent of the attribute under test (we are NOT using
    // *ByRole or any tag-shaped query here on purpose).
    const toolbar = screen.getByTestId("lobby-toolbar");

    // Pin the literal DOM element type. tagName is upper-case for
    // HTML documents per the DOM spec, which jsdom faithfully mirrors.
    expect(toolbar.tagName).toBe("DIV");
  });
});
