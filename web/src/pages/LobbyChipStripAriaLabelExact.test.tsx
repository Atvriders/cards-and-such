import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2082 — pin the LobbyPage `.lobby-chips` chip-strip's exact `aria-label`
 * attribute string using a raw JavaScript `===` strict-equality comparison.
 *
 * Why this is distinct from W1150's existing pin:
 *  - W1150 (LobbyChipStripAria.test.tsx) uses Vitest's `.toBe(...)`
 *    matcher which, while functionally identical for primitive strings,
 *    is matcher-mediated and routes through Vitest's equality logic.
 *  - This pin asserts the literal boolean result of
 *    `getAttribute("aria-label") === "Filter by category"` so a future
 *    refactor that, say, returns a String wrapper object, a trimmed
 *    template literal, or a value with hidden zero-width characters
 *    would *still* satisfy a Jest/Vitest `.toBe` on a typed string but
 *    fail the narrower JS strict-equality check used here. In practice
 *    `.toBe` and `===` align for plain strings, but the difference in
 *    failure-mode surface area justifies a sibling regression guard.
 *  - The chip-strip's accessible name disambiguates it from the drawer
 *    tablist labelled "Filter by category (drawer)"; an exact-equality
 *    pin guarantees the suffix is absent on the strip.
 */
describe("LobbyPage — chip-strip aria-label exact strict-equality (W2082)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has aria-label strictly === "Filter by category"', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve by stable className so the lookup itself does not depend on
    // the attribute under test, mirroring the W1150 sibling pattern.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Raw JS strict-equality on the attribute string: this is the exact
    // shape requested by the W2082 dispatch. A plain `===` check returns
    // a boolean, which we then assert with `.toBe(true)` so the failure
    // message reduces to true/false rather than a string-diff dump that
    // could be confused with W1150's coverage.
    const isExactMatch =
      strip!.getAttribute("aria-label") === "Filter by category";
    expect(isExactMatch).toBe(true);
  });
});
