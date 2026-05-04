import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1454 — the inner text span of the keyboard-shortcut tip
 * (`<span class="lobby-kbd-tip-text">…</span>`) is the dedicated
 * style hook that LobbyPage.css uses to format the inline `<kbd>`
 * chips and the surrounding prose. The CSS rules
 * `.lobby-kbd-tip-text` and `.lobby-kbd-tip-text kbd` would silently
 * detach if the className were renamed or dropped, leaving the kbd
 * pills unstyled inside the tip.
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's
 *    `role="note"`, and W1443 (LobbyKbdTipDismissAria.test.tsx)
 *    pins the dismiss button's aria-label, but neither touches the
 *    inner text-span className.
 *  - The existing LobbyPage.test.tsx coverage queries by
 *    `data-testid="lobby-kbd-tip"` only and never asserts the text
 *    span's class — so a silent rename would slip through.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — kbd-tip inner text span class (W1454)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner text span with className=\"lobby-kbd-tip-text\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the wrapper's stable className so the lookup is
    // independent of the attribute under test.
    const tip = document.querySelector<HTMLElement>(".lobby-kbd-tip");
    expect(tip).not.toBeNull();

    // Pin the inner span's exact className via direct DOM traversal
    // rather than a class-based selector — that way the assertion
    // proves the literal class string was rendered, not just that
    // *something* with that class exists in the document.
    const inner = tip!.querySelector<HTMLSpanElement>("span");
    expect(inner).not.toBeNull();
    expect(inner!.getAttribute("class")).toBe("lobby-kbd-tip-text");
  });
});
