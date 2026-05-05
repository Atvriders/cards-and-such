import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1967 — the chip-strip outer wrapper's `className` is *exactly*
 * `"lobby-chips-wrap"` on initial render (before any scroll happens).
 *
 * The wrapper is rendered (LobbyPage.tsx ~L2611-L2614) as:
 *
 *     <div
 *       className={`lobby-chips-wrap${canLeft ? " has-overflow-left" : ""}${canRight ? " has-overflow-right" : ""}`}
 *     >
 *
 * Both `canLeft` and `canRight` are initialised to `false`
 * (LobbyPage.tsx ~L2548-L2549) and only flip after a layout-driven
 * `scroll`/`resize` measurement, which jsdom does not perform during a
 * synchronous render. So the very first paint must produce an exact,
 * unmodified `"lobby-chips-wrap"` className string.
 *
 * Why this needs its own pin separate from W1286:
 *  - LobbyChipStripWrap.test.tsx (W1286) deliberately uses
 *    `classList.contains("lobby-chips-wrap")` — a TOKEN match — and
 *    documents (lines 65-69) that it avoids `===` so the conditional
 *    overflow modifier classes don't make the test brittle.
 *  - That leaves a coverage gap: a regression that introduced an
 *    *additional* unconditional class (e.g.
 *    `className="lobby-chips-wrap lobby-chip-strip"` during a partial
 *    rename, or accidentally appended a stray space / debug class)
 *    would still pass W1286's token-contains check while silently
 *    breaking any CSS that targets the wrapper via attribute selectors
 *    like `[class="lobby-chips-wrap"]` or external tooling that hashes
 *    the className string.
 *  - W1286 also pins `tagName === "DIV"` but explicitly NOT exact
 *    string equality — see the comment block at its lines 65-69.
 *
 * Using `===` here (rather than `classList.contains`) is the whole
 * point of this pin: it catches additive-class regressions that the
 * existing token-contains assertion is intentionally insensitive to.
 * We resolve the wrapper via the inner `.lobby-chips` track's
 * parentElement — exactly the same anchor W1286 uses — so the lookup
 * itself does not depend on the className string we're about to pin.
 */
describe("LobbyPage — chip-strip wrapper exact className (W1967)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the wrapper with className === "lobby-chips-wrap" on first paint', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the inner tablist track's stable className so the lookup
    // is independent of the wrapper className we're pinning. There is a
    // sibling drawer tablist with role="tablist", so querySelector on
    // the className is safer than getByRole here.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();
    // Sanity: confirm we actually resolved the chip-strip tablist and
    // not, say, a `.lobby-chips-arrow` button (which has the
    // `lobby-chips` substring as a class prefix).
    expect(strip!.getAttribute("role")).toBe("tablist");

    const wrap = strip!.parentElement;
    expect(wrap).not.toBeNull();

    // Exact-string equality (not classList.contains, not toContain) —
    // this is the regression pin. On initial render canLeft/canRight
    // are both false, so the template-literal collapses to the bare
    // base token with no trailing space.
    expect(wrap!.className).toBe("lobby-chips-wrap");
  });
});
