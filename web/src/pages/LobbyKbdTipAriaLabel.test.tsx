import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1573 — the keyboard-shortcut tip wrapper
 * (`<div class="lobby-kbd-tip" role="note">`) exposes
 * `aria-label="Keyboard shortcut tip"` so assistive tech announces
 * the note region with a meaningful accessible name rather than
 * silently entering an unnamed `role="note"` landmark.
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's
 *    `role="note"` but never asserts the accessible name attached
 *    to it.
 *  - W1443 (LobbyKbdTipDismissAria.test.tsx) covers the *dismiss
 *    button's* aria-label ("Dismiss keyboard shortcut tip"), which
 *    is a different element with a different label string.
 *  - W1454 (LobbyKbdTipTextClass.test.tsx), W1553
 *    (LobbyKbdTipDismissType.test.tsx), and W1561
 *    (LobbyKbdTipKbdCount.test.tsx) pin the inner text-span class,
 *    dismiss button type, and inner <kbd> chip count respectively —
 *    none of those touch the wrapper's aria-label.
 *  - LobbyPage.test.tsx queries the tip via `data-testid` but never
 *    asserts the accessible name. A regression dropping or renaming
 *    the aria-label would leave AT users hearing only "note" with
 *    no indication of what the note is about.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — kbd-tip wrapper aria-label (W1573)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the lobby-kbd-tip wrapper as \"Keyboard shortcut tip\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className rather than role/name so the
    // lookup itself is independent of the attribute under test.
    const tip = document.querySelector<HTMLElement>(".lobby-kbd-tip");
    expect(tip).not.toBeNull();

    // Pin the literal attribute value with getAttribute to read
    // exactly what was rendered into the DOM without any property
    // bridge normalisation.
    expect(tip!.getAttribute("aria-label")).toBe("Keyboard shortcut tip");
  });
});
