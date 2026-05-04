import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1637 — the first inner keystroke chip inside the lobby keyboard
 * shortcut tip is a literal `<kbd>` element. Pinning the rendered
 * `tagName` defends against a refactor that swaps `<kbd>` for
 * `<code>`, `<span>` or a styled component while keeping the textual
 * content "G". Such a swap would still satisfy the count + text pin
 * (W1561) if the new element preserved children, so the rendered tag
 * itself needs an independent assertion.
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's
 *    `role="note"`.
 *  - W1443 (LobbyKbdTipDismissAria.test.tsx) pins the dismiss
 *    button's aria-label.
 *  - W1454 (LobbyKbdTipTextClass.test.tsx) pins the inner text
 *    span's className.
 *  - W1553 (LobbyKbdTipDismissType.test.tsx) pins the dismiss
 *    button's `type="button"` (and asserts its tagName=BUTTON).
 *  - W1561 (LobbyKbdTipKbdCount.test.tsx) pins the count and
 *    textContent of the three inner chips, but uses a
 *    `querySelectorAll("kbd")` lookup that *presupposes* the chips
 *    are still `<kbd>` — it cannot detect a tag swap because a
 *    swapped element would simply be missed and the count would
 *    drop to zero (failing for the wrong reason).
 *  - W1628 (LobbyKbdTipWrapChildCount.test.tsx) pins the wrapper's
 *    direct child count.
 *  - None of those resolve the chip via a stable text node + inspect
 *    `tagName`, so a refactor like `<code>G</code>` could satisfy
 *    every existing pin (W1561 would fail with a misleading "got 0
 *    kbds" message rather than naming the swap).
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — kbd-tip inner chip tagName=KBD (W1637)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first keystroke chip as a literal <kbd> element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the tip via its stable wrapper className so the lookup
    // is independent of the attribute under test (`tagName` of the
    // inner chip).
    const tip = document.querySelector<HTMLElement>(".lobby-kbd-tip");
    expect(tip).not.toBeNull();

    // Resolve the first chip by walking the inner text span's
    // children rather than via `querySelector("kbd")` — that way a
    // tag swap surfaces as a clear "expected KBD, got <X>" failure
    // rather than a "no kbd found" miss.
    const textSpan = tip!.querySelector<HTMLElement>(".lobby-kbd-tip-text");
    expect(textSpan).not.toBeNull();

    // The first element child of the text span is the chip for "G".
    const firstChip = textSpan!.firstElementChild as HTMLElement | null;
    expect(firstChip).not.toBeNull();

    // Sanity: this is the chip we think it is.
    expect(firstChip!.textContent).toBe("G");

    // Pin the literal rendered tag. `tagName` is normalised to
    // upper-case for HTML elements, so the literal "KBD" string is
    // the stable assertion target.
    expect(firstChip!.tagName).toBe("KBD");
  });
});
