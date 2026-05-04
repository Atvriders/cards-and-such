import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1432 — the keyboard-shortcut tip rendered just below the lobby
 * hero (`<div class="lobby-kbd-tip">`) exposes itself to assistive
 * tech as `role="note"`, pairing with its `aria-label="Keyboard
 * shortcut tip"` to announce as a standalone informational note
 * rather than a generic group/region.
 *
 * Why this needs its own pin:
 *  - Existing LobbyPage.test.tsx coverage exercises the tip's
 *    visibility, dismiss button, and the
 *    `cards-lobby-kbd-tip-dismissed` localStorage round-trip — but
 *    no test pins the container's `role="note"` attribute.
 *  - A regression that drops or renames the role (e.g. to
 *    `"status"`, `"alert"`, or simply removes it) would silently
 *    flip the tip's accessibility-tree mapping from a polite
 *    informational note to a live region or a generic div.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — keyboard tip role=\"note\" (W1432)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("marks the lobby-kbd-tip wrapper with role=\"note\"", () => {
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
    expect(tip!.getAttribute("role")).toBe("note");
  });
});
