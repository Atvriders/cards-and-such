import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2221 — the LobbyPage hero eyebrow pulse dot
 *   <span className="lobby-hero-pulse" aria-hidden="true" />
 * (LobbyPage.tsx ~line 1850) MUST NOT carry an inline `style`
 * attribute. The pulse dot's animation, color, and size are owned
 * entirely by the `.lobby-hero-pulse` CSS class.
 *
 * Sibling pins on the pulse element:
 *   - W1223 / LobbyHeroPulse.test.tsx pins existence of the pulse span
 *     inside `.lobby-hero-eyebrow` and its `aria-hidden="true"`.
 *
 * Sibling no-style pins elsewhere on the lobby:
 *   - LobbyChipAllNoStyle.test.tsx pins the chip-all button.
 *   - LobbyChipStripNoStyle.test.tsx pins the chip-strip track.
 *   - LobbyDrawerAsideNoStyle.test.tsx pins the drawer aside.
 *   - LobbyAllGamesNoStyle.test.tsx pins the all-games region.
 *   - LobbyChipsWrapNoStyle.test.tsx pins the chips wrap.
 *
 * What none of those cover is the ABSENCE of an inline `style`
 * attribute on the hero pulse dot itself. A future refactor that
 * introduced e.g. `style={{ animationDelay: "...s" }}` or a JS-driven
 * dynamic style for the pulse effect would silently:
 *   1. Bypass the `.lobby-hero-pulse` stylesheet contract, making
 *      theme / reduced-motion overrides in CSS unable to win without
 *      `!important` workarounds.
 *   2. Couple the hero render output to per-render timing logic,
 *      reintroducing layout-thrash on every LobbyPage re-render.
 *   3. Defeat CSP `style-src` policies that disallow inline styles,
 *      which this app is free to adopt today precisely because the
 *      pulse dot emits no inline style.
 *
 * One focused assertion: the `.lobby-hero-pulse` span MUST NOT carry
 * a `style` attribute. If a future change deliberately needs inline
 * style, it should add the new attribute AND update this pin in the
 * same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * W2146 / W2112 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — hero pulse dot has no inline style attribute (W2221)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-hero-pulse span does NOT carry a style attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const pulse = container.querySelector(
      ".lobby-hero-eyebrow .lobby-hero-pulse",
    );

    // Sanity: confirm the pulse span actually exists. Without this
    // guard a future restructure that removed the span entirely would
    // make the no-style assertion pass vacuously.
    expect(pulse).not.toBeNull();
    expect(pulse?.tagName).toBe("SPAN");

    // The actual contract: no `style` attribute on the pulse dot.
    // Use `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could depend on, and DOM
    // `.style` reflection would silently mask its presence.
    expect(pulse?.hasAttribute("style")).toBe(false);
  });
});
