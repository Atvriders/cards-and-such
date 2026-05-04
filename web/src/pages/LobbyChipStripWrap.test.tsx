import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1286 — the chip strip's OUTER wrapper element is a `<div>` with
 * className `lobby-chips-wrap`. The wrapper is the positioning anchor
 * for the two `.lobby-chips-arrow` overflow buttons (which are absolutely
 * positioned against it) and is the host element on which the two
 * `has-overflow-left` / `has-overflow-right` modifier classes get
 * toggled to drive the fade-mask CSS.
 *
 * Why this needs its own pin:
 *  - LobbyChipStripAria.test.tsx (W1150) covers the *inner*
 *    `.lobby-chips` track (role="tablist", aria-label). LobbyPage.test.tsx
 *    (W661, ~L2210) exercises the overflow nudge buttons but only via
 *    the `.lobby-chips-arrow--left|right` selectors — it never asserts
 *    the *parent* wrapper's className or that it contains the tablist
 *    as a direct child.
 *  - A regression that renamed `lobby-chips-wrap` to `lobby-chip-strip`
 *    or removed the wrapper entirely (e.g. flattening the arrows into
 *    the track) would silently break the fade-mask CSS without
 *    triggering any existing test, because the modifier-class plumbing
 *    relies on this exact className being the toggle target.
 *  - Pinning the wrapper as the *parentElement* of the tablist also
 *    enforces structural invariants the arrow-toggling logic depends
 *    on (the arrows are siblings of the tablist, all under this div).
 *
 * Sibling-file placement mirrors the W1150 chip-strip pattern so this
 * test shares the `src/pages/Lobby` vitest path filter.
 */
describe("LobbyPage — chip-strip outer wrapper className (W1286)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wraps the chip-strip tablist in <div class=\"lobby-chips-wrap\">", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the inner track first via its stable className so the
    // assertion remains independent of the wrapper className we're
    // pinning. querySelector is preferred over getByRole here because
    // there is a sibling drawer tablist with the same role.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();
    // Sanity: the resolved element really is the chip-strip tablist
    // (and not, say, a `.lobby-chips-arrow` button which has the
    // `lobby-chips` substring as a class prefix).
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The wrapper is the *direct* parent. Asserting the parent rather
    // than just `document.querySelector(".lobby-chips-wrap")` enforces
    // the structural relationship: a future refactor that adds the
    // `lobby-chips-wrap` class somewhere else in the tree without
    // wrapping the tablist would still fail this pin.
    const wrap = strip!.parentElement;
    expect(wrap).not.toBeNull();
    expect(wrap!.tagName).toBe("DIV");

    // classList.contains rather than `===` so the conditional overflow
    // modifier classes (`has-overflow-left` / `has-overflow-right`),
    // which the W661 spec already covers, don't make this test brittle
    // when jsdom's overflow heuristics flip.
    expect(wrap!.classList.contains("lobby-chips-wrap")).toBe(true);
  });
});
