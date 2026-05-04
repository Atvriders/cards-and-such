import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1443 — the dismiss button inside the keyboard-shortcut tip
 * (`<button class="lobby-kbd-tip-dismiss">×</button>`) exposes
 * `aria-label="Dismiss keyboard shortcut tip"` so screen readers
 * announce a meaningful action rather than the visual "×" glyph.
 *
 * Why this needs its own pin:
 *  - Existing LobbyPage.test.tsx coverage clicks the button via its
 *    `data-testid` and W1432 (LobbyKbdTipRole.test.tsx) pins the
 *    container's role — but nothing pins the dismiss button's
 *    accessible name.
 *  - A regression dropping or renaming the aria-label would leave
 *    AT users hearing only the "×" character (or nothing), defeating
 *    the visually-hidden affordance that lets keyboard/AT users
 *    silence the tip.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits.
 */
describe("LobbyPage — kbd-tip dismiss aria-label (W1443)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the lobby-kbd-tip-dismiss button as \"Dismiss keyboard shortcut tip\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className rather than role/name so the
    // lookup itself is independent of the attribute under test.
    const dismiss = document.querySelector<HTMLElement>(
      ".lobby-kbd-tip-dismiss",
    );
    expect(dismiss).not.toBeNull();

    // Pin the literal attribute value with getAttribute to read
    // exactly what was rendered into the DOM without any property
    // bridge normalisation.
    expect(dismiss!.getAttribute("aria-label")).toBe(
      "Dismiss keyboard shortcut tip",
    );
  });
});
