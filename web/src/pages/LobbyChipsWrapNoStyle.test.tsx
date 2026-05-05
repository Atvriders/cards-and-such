import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2171 — the chip-strip OUTER wrapper (`.lobby-chips-wrap`) MUST NOT
 * carry an inline `style` attribute. The wrapper is the bare positioning
 * <div> rendered around lines 2611-2614 of LobbyPage.tsx with only a
 * className:
 *
 *     <div
 *       className={`lobby-chips-wrap${canLeft ? " has-overflow-left" : ""}${canRight ? " has-overflow-right" : ""}`}
 *     >
 *
 * Sibling pins on the SAME outer wrapper currently in the suite:
 *   - W1286 / LobbyChipStripWrap pins `tagName === "DIV"` and that the
 *     wrapper carries the `lobby-chips-wrap` class token.
 *   - W1967 / LobbyChipsWrapClass pins the exact `className` string on
 *     first paint (no extra tokens, no rename).
 *   - W1997 / LobbyChipsWrapAttr pins the absence of a `role` attribute
 *     on the wrapper.
 *   - W2041 / LobbyChipsWrapNoId pins the absence of an `id` attribute
 *     on the wrapper.
 *
 * The companion W2112 / LobbyChipStripNoStyle pin asserts the same
 * `style` absence one level DEEPER on the inner `.lobby-chips` tablist
 * track. NONE of the existing wrap pins cover the absence of an inline
 * `style` attribute on the OUTER `.lobby-chips-wrap` <div>. A regression
 * that introduced e.g. `style={{ overflowX: "auto" }}` or a JS-driven
 * `style={{ transform: ... }}` on the wrapper would silently:
 *   1. Bypass the established stylesheet contract for this element,
 *      which lives entirely in LobbyPage.css and relies on the
 *      `has-overflow-left` / `has-overflow-right` className modifiers
 *      (driven by the `nudge` callback's scroll-overflow detection)
 *      rather than inline style for visual state.
 *   2. Couple visual presentation to React render passes instead of
 *      letting the stylesheet cascade decide, fighting the existing
 *      `.has-overflow-left` / `.has-overflow-right` modifier classes.
 *   3. Defeat CSP `style-src` policies that disallow inline styles,
 *      which deployments may rely on. The contract for this wrapper
 *      is that it carries no inline style.
 *
 * One focused assertion: the outer `.lobby-chips-wrap` <div> MUST NOT
 * carry a `style` attribute. If a future change deliberately needs
 * inline style (e.g., a JS-controlled scroll-snap offset), it should
 * add the new `style` AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W1997 / W2036 / W2041 / W2112 pattern so
 * the test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip wrapper has no inline style attribute (W2171)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips-wrap outer <div> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the inner tablist track's stable className and walk up
    // to the wrapper. There is a sibling drawer tablist with
    // role="tablist" elsewhere in the tree, so going via
    // `.lobby-chips`'s parentElement is safer than getByRole and is the
    // same anchor strategy W1286 / W1967 / W1997 / W2041 use. Crucially,
    // this lookup is independent of any `style` attribute on the
    // wrapper, so it cannot vacuously pass.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    const wrap = strip!.parentElement;
    expect(wrap).not.toBeNull();
    // Sanity: anchor is the chip-strip wrapper, not some other ancestor
    // — guards against a future restructure that moved `.lobby-chips`
    // under a different parent and would otherwise let the assertion
    // pass against the wrong element.
    expect(wrap!.tagName).toBe("DIV");
    expect(wrap!.classList.contains("lobby-chips-wrap")).toBe(true);

    // The actual contract: no `style` attribute on the outer wrapper.
    // Use `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code could come to depend on, and DOM `.style` reflection
    // would silently mask its presence.
    expect(wrap!.hasAttribute("style")).toBe(false);
  });
});
