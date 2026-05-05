import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2112 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an inline `style` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2623-2630 of LobbyPage.tsx; its visual presentation
 * is owned entirely by the `.lobby-chips` CSS class, not by any inline
 * style prop.
 *
 * Sibling pins on this same `.lobby-chips` track:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - LobbyChipStripChildCount.test.tsx pins exact direct child count.
 *   - LobbyChipStripWrap.test.tsx pins the outer wrapper structure.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the chip-strip track itself. A future refactor that introduced e.g.
 * `style={{ overflowX: "auto" }}` or a JS-driven `style={{ transform: ... }}`
 * for scroll positioning would silently:
 *   1. Bypass the established stylesheet contract for this element,
 *      making theme/dark-mode/print overrides in CSS impossible to
 *      apply without `!important` workarounds.
 *   2. Couple the component's render output to per-render measurement
 *      logic (e.g., reading `trackRef.current.scrollLeft` during render),
 *      reintroducing layout-thrash patterns the current arrow-overflow
 *      design specifically avoids by using a `ref` + event listeners.
 *   3. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app's deployment is free to adopt today precisely because the
 *      chip strip carries no inline style.
 *
 * One focused assertion: the inner `.lobby-chips` track MUST NOT carry
 * a `style` attribute. If a future change deliberately needs inline
 * style (e.g., JS-controlled scroll-snap), it should add the new
 * attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no inline style attribute (W2112)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent of
    // the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not, say, a
    // `.lobby-chips-arrow` overflow button (which has the chained
    // className) or the outer `.lobby-chips-wrap`. Without this guard a
    // future restructure that moved the className onto a wrapper could
    // pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `style` attribute on the chip-strip track.
    // Use `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could come to depend on,
    // and DOM `.style` reflection would silently mask its presence.
    expect(strip!.hasAttribute("style")).toBe(false);
  });
});
