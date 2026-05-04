import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1628 — the keyboard-shortcut tip wrapper (`.lobby-kbd-tip`) renders
 * exactly two element children: the inner text span (which holds the
 * prose + the inline <kbd> chips) and the dismiss <button>. The two-
 * child shape is load-bearing for the tip's CSS layout (the dismiss
 * button is positioned relative to the text span as a flex sibling)
 * and any refactor that injected an extra wrapper or split the text
 * across multiple spans would silently break the visual layout.
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's role="note".
 *  - W1573 (LobbyKbdTipAriaLabel.test.tsx) pins the wrapper's
 *    aria-label.
 *  - W1584 (LobbyKbdTipWrapTag.test.tsx) pins the wrapper's
 *    tagName=DIV.
 *  - W1454 (LobbyKbdTipTextClass.test.tsx) pins the inner text span's
 *    className but does not constrain the *number* of children on
 *    the wrapper.
 *  - W1443/W1553/W1596/W1608/W1616 (LobbyKbdTipDismiss*.test.tsx) all
 *    pin attributes on the dismiss button itself.
 *  - W1561 (LobbyKbdTipKbdCount.test.tsx) pins the count of inner
 *    <kbd> chips, which lives inside the text span — not on the
 *    wrapper.
 *  - None of those reject a regression that added a third sibling
 *    (e.g. an extra icon span) directly under `.lobby-kbd-tip`.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — kbd-tip wrapper child count (W1628)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the .lobby-kbd-tip wrapper with exactly two element children", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the wrapper's stable className so the lookup itself
    // is independent of the attribute under test (childElementCount).
    const tip = document.querySelector<HTMLElement>(".lobby-kbd-tip");
    expect(tip).not.toBeNull();

    // Pin the exact element-child count: the text span + the dismiss
    // button. Using `childElementCount` (rather than `children.length`
    // alone) is the canonical DOM property for this assertion and
    // ignores any whitespace text nodes that JSX might emit.
    expect(tip!.childElementCount).toBe(2);
  });
});
