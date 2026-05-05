import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2146 — the LobbyPage `chip-all` Chip button MUST NOT carry an inline
 * `style` attribute. The Chip component (LobbyPage.tsx ~line 2651) renders
 * a `<button>` whose visual presentation is owned entirely by the
 * `.lobby-chip` / `.lobby-chip.is-active` CSS classes, not by any inline
 * style prop.
 *
 * Sibling pins on the chip-all button surface:
 *   - LobbyAllChipBadge.test.tsx pins the count badge text.
 *   - LobbyChipType.test.tsx pins `type="button"` on the Chip element.
 *   - LobbyChipTag.test.tsx pins `tagName === "BUTTON"`.
 *   - LobbyChipWrapClass.test.tsx pins the className contract.
 *
 * Sibling no-style pins elsewhere on the lobby:
 *   - W2112 / LobbyChipStripNoStyle.test.tsx pins the chip-strip track.
 *   - LobbyDrawerAsideNoStyle.test.tsx pins the drawer aside.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the chip-all button itself. A future refactor that introduced e.g.
 * `style={{ minWidth: "8rem" }}` or a JS-driven dynamic style for
 * highlight effects would silently:
 *   1. Bypass the established `.lobby-chip` stylesheet contract, making
 *      theme / dark-mode overrides in CSS unable to win without
 *      `!important` workarounds.
 *   2. Couple Chip's render output to per-render measurement logic,
 *      reintroducing layout-thrash patterns the strip-level scroll
 *      design specifically avoids via refs + event listeners.
 *   3. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app is free to adopt today precisely because Chip emits no
 *      inline style.
 *
 * One focused assertion: the `chip-all` button MUST NOT carry a `style`
 * attribute. If a future change deliberately needs inline style, it
 * should add the new attribute AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * W2112 / W2036 / W1908 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-all button has no inline style attribute (W2146)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-all button does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all");

    // Sanity: confirm we pinned the actual chip-all button and not a
    // descendant. Without this guard a future restructure that moved
    // the testid onto a wrapper could pass this assertion vacuously.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `style` attribute on chip-all. Use
    // `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could depend on, and DOM
    // `.style` reflection would silently mask its presence.
    expect(chip.hasAttribute("style")).toBe(false);
  });
});
