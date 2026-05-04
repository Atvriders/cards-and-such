import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1596 — the keyboard-shortcut tip's dismiss button
 * (`<button class="lobby-kbd-tip-dismiss">×</button>`) renders the
 * literal multiplication-sign glyph "×" (U+00D7) as its visible text
 * content. This is the one piece of UI that sighted users actually
 * click on; the screen-reader-facing `aria-label` is pinned by
 * W1443, but the rendered glyph itself has no other coverage.
 *
 * Why this needs its own pin:
 *  - W1443 (LobbyKbdTipDismissAria.test.tsx) asserts the
 *    `aria-label="Dismiss keyboard shortcut tip"` so AT users hear a
 *    meaningful action, not the glyph. If the visible "×" were ever
 *    swapped for an empty string, an emoji, or a plain ASCII "x",
 *    AT users wouldn't notice (their experience is the aria-label),
 *    but sighted users would lose the conventional close affordance.
 *  - W1553 (LobbyKbdTipDismissType.test.tsx) pins `type="button"`,
 *    W1454 pins the inner text span's className, and W1561 pins the
 *    `<kbd>` count and contents — none of those touch the dismiss
 *    button's rendered text.
 *  - LobbyPage.test.tsx clicks the dismiss button by `data-testid`
 *    but never asserts the rendered glyph; replacing "×" with any
 *    other clickable character would still pass that suite.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits.
 */
describe("LobbyPage — kbd-tip dismiss button glyph (W1596)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lobby-kbd-tip-dismiss button with the \"×\" glyph as its text content", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className so the lookup itself is
    // independent of the attribute under test (the textContent).
    const dismiss = document.querySelector<HTMLElement>(
      ".lobby-kbd-tip-dismiss",
    );
    expect(dismiss).not.toBeNull();

    // Pin the exact rendered glyph — U+00D7 MULTIPLICATION SIGN —
    // not an ASCII "x", a plain hyphen, or an emoji. The button is
    // a leaf element with no whitespace in JSX, so textContent is
    // exactly the rendered glyph with no trimming required.
    expect(dismiss!.textContent).toBe("×");
  });
});
