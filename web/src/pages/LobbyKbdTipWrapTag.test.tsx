import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1584 — the keyboard-shortcut tip wrapper
 * (`<div class="lobby-kbd-tip" role="note" aria-label="Keyboard
 * shortcut tip">…</div>`) is rendered as a `<div>` element, not as
 * an inline span/article/aside or any other tag.
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's `role`,
 *    W1573 (LobbyKbdTipAriaLabel.test.tsx) pins the wrapper's
 *    `aria-label`, W1443 (LobbyKbdTipDismissAria.test.tsx) pins the
 *    dismiss button's `aria-label`, W1454
 *    (LobbyKbdTipTextClass.test.tsx) pins the inner span class,
 *    W1553 (LobbyKbdTipDismissType.test.tsx) pins the dismiss
 *    button's `type`, and W1561 (LobbyKbdTipKbdCount.test.tsx) pins
 *    the count of inner `<kbd>` elements — none of those touch the
 *    wrapper's tag name.
 *  - A regression that swaps the wrapper to a `<span>` or `<aside>`
 *    would silently break the block-level layout the lobby-kbd-tip
 *    CSS targets (display flex, padding, the dismiss-button
 *    positioning) while every existing test (which resolves the tip
 *    via `data-testid` or `.lobby-kbd-tip`) would still pass.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits.
 */
describe("LobbyPage — kbd-tip wrapper tag name (W1584)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lobby-kbd-tip wrapper as a <div> element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className so the lookup itself is
    // independent of the attribute under test (`tagName`).
    const tip = document.querySelector<HTMLElement>(".lobby-kbd-tip");
    expect(tip).not.toBeNull();

    // Pin the literal rendered tag. `tagName` is normalised to
    // upper-case by the DOM, matching what JSX emits for a `<div>`.
    expect(tip!.tagName).toBe("DIV");
  });
});
