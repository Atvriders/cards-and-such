import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1616 — the keyboard-shortcut tip's dismiss button
 * (`<button class="lobby-kbd-tip-dismiss">×</button>`) is rendered as
 * a leaf element: it has zero child *elements*, only the literal `×`
 * text node. This pins the button's structure as flat — no inner
 * `<span>`, `<svg>`, or icon-wrapper sub-element — so visual styling
 * stays anchored to the button itself.
 *
 * Why this needs its own pin (distinct from existing W14xx/W15xx/W16xx):
 *  - W1443 (LobbyKbdTipDismissAria.test.tsx) covers the `aria-label`.
 *  - W1553 (LobbyKbdTipDismissType.test.tsx) covers `type="button"` and
 *    the button's `tagName`.
 *  - W1596 (LobbyKbdTipDismissGlyph.test.tsx) covers the rendered
 *    `×` text content.
 *  - W1608 (LobbyKbdTipDismissClassList.test.tsx) covers the single
 *    `lobby-kbd-tip-dismiss` className.
 *  - None of those assert that the button has *no* element children.
 *    A future refactor that wrapped the glyph in `<span aria-hidden>`
 *    would still satisfy textContent and classList checks but would
 *    silently change focus/keyboard target geometry — this test
 *    catches that.
 */
describe("LobbyPage — kbd-tip dismiss button leaf structure (W1616)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lobby-kbd-tip-dismiss button with zero child elements", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const dismiss = document.querySelector<HTMLElement>(
      ".lobby-kbd-tip-dismiss",
    );
    expect(dismiss).not.toBeNull();

    // Pin the leaf shape: no inner element wrappers.
    expect(dismiss!.childElementCount).toBe(0);
    expect(dismiss!.children.length).toBe(0);
  });
});
