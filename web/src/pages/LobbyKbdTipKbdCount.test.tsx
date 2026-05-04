import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1561 — the keyboard-shortcut tip prose embeds three inline
 * `<kbd>` chips ("G", "H", "?") that visually represent the actual
 * keystrokes the user can press. The chips are the entire reason the
 * tip exists; if a refactor were to drop them (or replace them with
 * plain `<span>`s) the tip would lose its semantic-keystroke styling
 * hook and assistive-tech users would no longer hear them announced
 * as keyboard input.
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's
 *    `role="note"`.
 *  - W1443 (LobbyKbdTipDismissAria.test.tsx) pins the dismiss
 *    button's aria-label.
 *  - W1454 (LobbyKbdTipTextClass.test.tsx) pins the inner text
 *    span's className.
 *  - W1553 (LobbyKbdTipDismissType.test.tsx) pins the dismiss
 *    button's `type="button"`.
 *  - None of those touch the inner `<kbd>` elements themselves —
 *    a refactor that swapped `<kbd>` for `<code>` or `<span>` would
 *    slip through every existing pin.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — kbd-tip inner <kbd> chips (W1561)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders three <kbd> chips with text G, H, ? inside the tip text span", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the wrapper's stable className so the lookup is
    // independent of the attribute under test.
    const tip = document.querySelector<HTMLElement>(".lobby-kbd-tip");
    expect(tip).not.toBeNull();

    // Scope the kbd lookup to the tip wrapper so unrelated <kbd>
    // chips elsewhere on the page (if any) cannot accidentally
    // satisfy this assertion.
    const kbds = tip!.querySelectorAll("kbd");
    expect(kbds.length).toBe(3);
    expect(kbds[0]!.textContent).toBe("G");
    expect(kbds[1]!.textContent).toBe("H");
    expect(kbds[2]!.textContent).toBe("?");
  });
});
