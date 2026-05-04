import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1608 — the keyboard-shortcut tip's dismiss button
 * (`<button class="lobby-kbd-tip-dismiss">×</button>`) is rendered
 * with exactly one CSS class — `lobby-kbd-tip-dismiss` — and no
 * stray utility/state classes leaked from local edits.
 *
 * Why this needs its own pin:
 *  - W1443 (LobbyKbdTipDismissAria.test.tsx) pins the dismiss
 *    button's `aria-label`, W1553 (LobbyKbdTipDismissType.test.tsx)
 *    pins the rendered `type="button"` attribute, and W1596
 *    (LobbyKbdTipDismissGlyph.test.tsx) pins the "×" glyph as the
 *    button's text content. None of those inspect the *content* of
 *    the button's classList — only that the className selector
 *    still resolves an element.
 *  - LobbyPage.test.tsx looks the button up by `data-testid` and
 *    never asserts how many classes it carries. If a future edit
 *    added a transient class such as `lobby-kbd-tip-dismiss
 *    is-active` (e.g. a hover/animation helper) the existing pins
 *    would still pass, but the styling contract — exactly one
 *    purpose-named class — would silently drift.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits.
 */
describe("LobbyPage — kbd-tip dismiss button classList (W1608)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the dismiss button with exactly the single \"lobby-kbd-tip-dismiss\" class", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via data-testid so the lookup itself does not depend
    // on the className being correct — otherwise a regression in the
    // class would manifest as a missing element rather than as a
    // failed classList assertion.
    const dismiss = document.querySelector<HTMLElement>(
      "[data-testid=\"lobby-kbd-tip-dismiss\"]",
    );
    expect(dismiss).not.toBeNull();

    // Pin the *content* of the classList: exactly one token, and
    // that token is the documented purpose-named class. Using
    // classList (rather than className === "...") still rejects
    // stray classes but makes the failure message list the actual
    // tokens, which is friendlier when a regression is introduced.
    expect(dismiss!.classList.length).toBe(1);
    expect(dismiss!.classList.contains("lobby-kbd-tip-dismiss")).toBe(true);
  });
});
