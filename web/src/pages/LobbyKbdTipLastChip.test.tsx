import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1649 — the last keystroke chip inside the lobby keyboard-shortcut
 * tip text span is the "?" chip ("press ? for shortcuts"). This pin
 * resolves the chip via `textSpan.lastElementChild` rather than via
 * `querySelectorAll("kbd")[2]`, so it independently asserts that the
 * trailing element of the inner text span is a `<kbd>` whose
 * textContent is the literal "?".
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's role.
 *  - W1443 (LobbyKbdTipDismissAria.test.tsx) pins the dismiss
 *    button's aria-label.
 *  - W1454 (LobbyKbdTipTextClass.test.tsx) pins the inner text
 *    span's className.
 *  - W1553 (LobbyKbdTipDismissType.test.tsx) pins the dismiss
 *    button's `type="button"`.
 *  - W1561 (LobbyKbdTipKbdCount.test.tsx) pins the count and texts
 *    of all three chips, but resolves them by `querySelectorAll`
 *    which is order-fragile only insofar as document order matches
 *    insertion order — it does not pin the chip via the parent's
 *    `lastElementChild` traversal, so a refactor that re-ordered the
 *    chips (e.g. moved "?" before "G H") could still satisfy W1561's
 *    "kbds[2].textContent === '?'" only if document order happens to
 *    match — but a refactor that wraps the trailing chip in an extra
 *    `<span>` (so the literal `lastElementChild` of the text span is
 *    no longer a `<kbd>`) would slip through W1561 entirely.
 *  - W1628 (LobbyKbdTipWrapChildCount.test.tsx) pins the *wrapper's*
 *    direct child count, not the *text span's* trailing element.
 *  - W1637 (LobbyKbdTipKbdTag.test.tsx) pins the *first* chip's
 *    tagName via `firstElementChild` traversal — the symmetric pin
 *    on `lastElementChild` is uncovered.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — kbd-tip text span lastElementChild is <kbd>? (W1649)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the trailing inner element of the tip text span as <kbd>?</kbd>", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the tip via its stable wrapper className so the lookup
    // is independent of the attribute under test (`lastElementChild`
    // of the inner text span).
    const tip = document.querySelector<HTMLElement>(".lobby-kbd-tip");
    expect(tip).not.toBeNull();

    const textSpan = tip!.querySelector<HTMLElement>(".lobby-kbd-tip-text");
    expect(textSpan).not.toBeNull();

    // Walk to the trailing element child rather than using
    // `querySelectorAll("kbd")[2]` — this way a refactor that wraps
    // the last chip in an extra container (so the text span's literal
    // last element child is no longer a `<kbd>`) surfaces as a clear
    // tag-mismatch failure.
    const lastChip = textSpan!.lastElementChild as HTMLElement | null;
    expect(lastChip).not.toBeNull();

    // Pin the literal rendered tag. `tagName` is normalised to
    // upper-case for HTML elements, so the literal "KBD" string is
    // the stable assertion target.
    expect(lastChip!.tagName).toBe("KBD");

    // Sanity: this is the trailing chip we think it is — the "?"
    // shortcuts chip.
    expect(lastChip!.textContent).toBe("?");
  });
});
