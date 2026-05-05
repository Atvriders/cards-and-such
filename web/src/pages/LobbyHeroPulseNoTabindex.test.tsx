import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2281 — the LobbyPage hero eyebrow pulse dot
 *   <span className="lobby-hero-pulse" aria-hidden="true" />
 * (LobbyPage.tsx ~line 1850) MUST NOT carry a `tabindex` attribute.
 *
 * The pulse dot is a purely decorative animation element. It is
 * marked `aria-hidden="true"` precisely because it carries no
 * semantic meaning to assistive tech, and it must remain outside
 * the keyboard-focus tab order entirely. A `tabindex` attribute
 * (whether `tabindex="0"`, `tabindex="-1"`, or any other value)
 * would:
 *   1. Contradict the `aria-hidden="true"` declaration — focusable
 *      `aria-hidden` elements are a documented WAI-ARIA failure
 *      pattern (FA-axe rule "aria-hidden-focus") that screen-reader
 *      users hit as a "phantom" focus stop with no announcement.
 *   2. Add a meaningless tab stop in the lobby header, pushing the
 *      first real interactive element (the hero links / drawer
 *      controls) further down the keyboard sequence and degrading
 *      keyboard-only navigation speed on every visit.
 *   3. Even `tabindex="-1"` (programmatic-only focus) would imply
 *      that some code path intends to `.focus()` the pulse dot,
 *      which would move the screen-reader caret onto a
 *      `aria-hidden` element and cause undefined AT behavior.
 *
 * Sibling pins on the pulse element:
 *   - LobbyHeroPulse.test.tsx pins existence of the pulse span
 *     inside `.lobby-hero-eyebrow` and its `aria-hidden="true"`.
 *   - LobbyHeroPulseNoStyle.test.tsx pins absence of inline `style`.
 *
 * Sibling no-tabindex pins elsewhere on the lobby:
 *   - LobbyChipStripNoTabindex.test.tsx pins the chip-strip track.
 *   - LobbyChipsWrapNoTabindex.test.tsx pins the chips wrap.
 *   - LobbyDrawerAsideNoTabIndex.test.tsx pins the drawer aside.
 *
 * What none of those cover is the ABSENCE of a `tabindex`
 * attribute on the hero pulse dot itself. One focused assertion:
 * the `.lobby-hero-pulse` span MUST NOT carry a `tabindex`
 * attribute. If a future change deliberately needs to put the
 * pulse in the tab order, it should drop `aria-hidden="true"`,
 * add the `tabindex`, AND update this pin in the same commit,
 * making the accessibility trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following
 * the W2146 / W2112 / W2036 / W2221 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — hero pulse dot has no tabindex attribute (W2281)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-hero-pulse span does NOT carry a tabindex attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const pulse = container.querySelector(
      ".lobby-hero-eyebrow .lobby-hero-pulse",
    );

    // Sanity: confirm the pulse span actually exists. Without this
    // guard a future restructure that removed the span entirely
    // would make the no-tabindex assertion pass vacuously.
    expect(pulse).not.toBeNull();
    expect(pulse?.tagName).toBe("SPAN");

    // The actual contract: no `tabindex` attribute on the pulse
    // dot. Use `hasAttribute` rather than inspecting `.tabIndex` —
    // the DOM `tabIndex` IDL property defaults to `-1` for elements
    // without the attribute, which would silently mask the
    // presence/absence distinction this pin enforces.
    expect(pulse?.hasAttribute("tabindex")).toBe(false);
  });
});
