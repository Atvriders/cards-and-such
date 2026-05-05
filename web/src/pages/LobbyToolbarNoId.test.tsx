import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2043 — the lobby toolbar wrapper intentionally has NO `id`
 * attribute. The element is resolved exclusively via the stable
 * `data-testid="lobby-toolbar"` hook and labelled via `aria-label`
 * + `role="group"`; nothing in the page (or its CSS / aria-*
 * relations) targets the toolbar by `#id`.
 *
 * Why this needs its own pin:
 *  - Sibling pins (W1381 aria-label, W1270 role, etc.) cover the
 *    attributes that DO appear, but none assert the absence of an
 *    `id`. A drive-by refactor that adds e.g. `id="lobby-toolbar"`
 *    for an aria-controls relation would silently change the public
 *    DOM contract — duplicate ids elsewhere on the page (the
 *    overflow popover, future toolbars) would then produce invalid
 *    HTML without any test failing.
 *  - Mirrors the W1856/LobbyChipStripNoId.test pattern: pin the
 *    "no id" invariant at the same granularity as the "has X"
 *    invariants on the same element.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * keeps the test under the `src/pages/Lobby` vitest filter and avoids
 * collisions with concurrent test additions.
 */
describe("LobbyPage — toolbar has no id attribute (W2043)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render an id attribute on the lobby toolbar wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id so the lookup is independent of
    // the attribute under inspection.
    const toolbar = screen.getByTestId("lobby-toolbar");

    // Pin the literal absence. `hasAttribute` (rather than reading
    // `.id`, which always returns "" for missing ids) distinguishes
    // "no attribute rendered" from "attribute rendered as empty".
    expect(toolbar.hasAttribute("id")).toBe(false);
  });
});
