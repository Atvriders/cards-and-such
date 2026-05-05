import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2114 — the lobby toolbar wrapper intentionally has NO inline
 * `style` attribute. Layout (flex direction, gap, wrapping) is
 * delivered exclusively via the `lobby-toolbar` class in CSS so the
 * styling can be themed and overridden at the stylesheet layer; the
 * JSX must not leak ad-hoc inline styles that would defeat that
 * cascade.
 *
 * Why this needs its own pin:
 *  - Sibling pins (W2043 no-id, W1381 aria-label, W1270 role) assert
 *    the attributes that DO appear / are explicitly absent, but none
 *    of them catch a drive-by addition of `style={{ ... }}` — for
 *    example a one-off `style={{ marginTop: 8 }}` to nudge spacing.
 *    Such a change silently bypasses the stylesheet contract and the
 *    responsive (<700px) collapse behaviour described above the JSX.
 *  - Mirrors the W2043/LobbyToolbarNoId pattern: pin the "no style"
 *    invariant at the same granularity as the other toolbar pins.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * keeps the test under the `src/pages/Lobby` vitest filter and avoids
 * collisions with concurrent test additions.
 */
describe("LobbyPage — toolbar has no inline style attribute (W2114)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render a style attribute on the lobby toolbar wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id so the lookup is independent of
    // the attribute under inspection.
    const toolbar = screen.getByTestId("lobby-toolbar");

    // Pin the literal absence. `hasAttribute("style")` distinguishes
    // "no attribute rendered" from "attribute rendered as empty
    // string" — JSDOM serialises an empty `style={}` object as no
    // attribute, so this catches any non-empty inline style.
    expect(toolbar.hasAttribute("style")).toBe(false);
  });
});
