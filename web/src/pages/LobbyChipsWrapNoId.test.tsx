import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2041 — the chip-strip OUTER wrapper (`.lobby-chips-wrap`) MUST NOT
 * carry an `id` attribute. The wrapper is the bare positioning <div>
 * rendered around lines 2611-2614 of LobbyPage.tsx with only a
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
 *
 * What NONE of those cover is the absence of an `id` attribute on the
 * wrapper itself. The companion W2036 / LobbyChipStripNoId pin asserts
 * the same property one level DEEPER on the inner `.lobby-chips`
 * tablist track — but a regression that introduced e.g.
 * `id="lobby-chips-wrap"` (or any other id) on the outer wrapper would
 * sail through every existing pin and silently:
 *   1. Create a stable URL fragment target (`/#lobby-chips-wrap`) that
 *      external links and bookmarks could come to depend on, making
 *      it an undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from elsewhere on the
 *      page (e.g. the drawer's filter section) to point at the wrapper,
 *      coupling sibling components to an attribute this codebase has
 *      deliberately not advertised.
 *   3. Risk an id collision with the sibling drawer tablist's own
 *      announced ids or any other element on the page — jsdom and
 *      browsers tolerate duplicate ids at render time but
 *      `getElementById` and URL fragment scrolling break.
 *
 * One focused assertion: the outer `.lobby-chips-wrap` <div> MUST NOT
 * carry an `id` attribute. If a future change deliberately needs one,
 * it should add the new `id` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W1997 / W2036 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip wrapper has no id attribute (W2041)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips-wrap outer <div> does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the inner tablist track's stable className and walk up
    // to the wrapper. There is a sibling drawer tablist with
    // role="tablist" elsewhere in the tree, so going via
    // `.lobby-chips`'s parentElement is safer than getByRole and is the
    // same anchor strategy W1286 / W1967 / W1997 use. Crucially, this
    // lookup is independent of any `id` attribute on the wrapper, so it
    // cannot vacuously pass.
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

    // The actual contract: no `id` attribute on the outer wrapper.
    // Use `hasAttribute` rather than checking for an empty string —
    // an `id=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(wrap!.hasAttribute("id")).toBe(false);
  });
});
