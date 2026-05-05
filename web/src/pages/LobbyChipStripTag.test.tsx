import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1908 — the chip-strip tablist element (`.lobby-chips`) is rendered as
 * a `<div>` element, NOT as a semantic list (`<ul>`/`<ol>`) or a `<nav>`
 * landmark. LobbyPage.tsx ~L2623-2630 hand-rolls the track:
 *
 *   <div
 *     ref={trackRef}
 *     className="lobby-chips"
 *     role="tablist"
 *     aria-label="Filter by category"
 *   >
 *     {children}
 *   </div>
 *
 * Why this needs its own pin:
 *  - W1150 (LobbyChipStripAria) covers the chip-strip's `aria-label`
 *    and `role`, but does not enforce the host element's tag name —
 *    a refactor that swaps the host for `<ul>` or `<nav>` would still
 *    satisfy that test while introducing implicit list semantics that
 *    the ARIA `role="tablist"` is already responsible for.
 *  - W1894 (LobbyChipStripChildCount) covers `childElementCount` but
 *    similarly leaves the host tagName unpinned.
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div's tagName, not the inner `.lobby-chips` track's tagName.
 *  - The chip-strip uses CSS overflow scrolling (`scrollBy` in `nudge`,
 *    `clientWidth` arithmetic) which assumes a non-list host: switching
 *    to `<ul>` would inherit user-agent default `padding-inline-start`
 *    and `list-style` rules that would visually disturb the strip.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W1150/W1894/W1286 sibling pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the main spec.
 */
describe("LobbyPage — chip strip host tagName (W1908)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the .lobby-chips tablist as a <div> element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className rather than the role so the
    // lookup itself is independent of the role attribute (which is
    // pinned separately by W1150). querySelector is preferred over
    // getByRole here because the drawer also renders a role="tablist"
    // element, and we specifically want the chip strip.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: the resolved element really is the chip-strip tablist
    // (and not, say, a `.lobby-chips-arrow` overflow button which
    // shares the `lobby-chips` substring as a class prefix).
    expect(strip!.classList.contains("lobby-chips")).toBe(true);
    expect(strip!.classList.contains("lobby-chips-arrow")).toBe(false);
    expect(strip!.classList.contains("lobby-chips-wrap")).toBe(false);

    // Pin the literal tagName. `tagName` is upper-cased by the DOM
    // for HTML elements, so the expected value is "DIV". A regression
    // that swaps the host for `<ul>`, `<ol>`, `<nav>`, or `<section>`
    // — even while preserving `role="tablist"` — would fail here.
    expect(strip!.tagName).toBe("DIV");
  });
});
