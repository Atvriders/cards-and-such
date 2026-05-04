import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";

/**
 * W1180 — the lobby hero subtitle (`<p class="lobby-sub">` /
 * data-testid="lobby-total-count") prints the full registry size as
 * `<count> games and counting — pick one and deal yourself in.`,
 * with the count formatted via `Number#toLocaleString` so registries
 * that grow past a thousand entries render with comma grouping rather
 * than a raw 4-digit number.
 *
 * Why this needs its own pin:
 *  - Existing Lobby coverage exercises the chip strip, hero stats row,
 *    drawer, and infinite-mode "Loaded N of M" caption, but no test
 *    asserts the hero subtitle's total-count surface or its grouping
 *    contract. A regression that drops the `.toLocaleString()` call
 *    or renames the trailing copy would slip through silently.
 *  - The numeral inside this <strong> is the FIRST quantitative claim
 *    a visitor reads on the page — pinning the shape protects the
 *    "Live Catalog" framing from drift as new games are added.
 *
 * Sibling-file placement mirrors the W1165 hero-stats-aria pattern so
 * this test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to LobbyPage.test.tsx.
 */
describe("LobbyPage — hero subtitle total-count (W1180)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders '<GAMES.length.toLocaleString()> games and counting — …' inside lobby-total-count", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const sub = getByTestId("lobby-total-count");

    // The count lives in a nested <strong> so AT can render it as
    // emphasised text. Read the registry size through the same code
    // path the component uses (`GAMES.length.toLocaleString()`) so the
    // assertion survives registry growth without re-flaking.
    const expected = GAMES.length.toLocaleString();
    const strong = sub.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe(expected);

    // Pin the trailing copy verbatim — it includes a non-ASCII em-dash
    // (U+2014) which a regression that switches to a hyphen-minus
    // ("-") or removes the dash entirely must trip on.
    expect(sub.textContent).toBe(
      `${expected} games and counting — pick one and deal yourself in.`,
    );

    // Comma-grouping contract: once the registry crosses 1,000 entries
    // the locale-formatted numeral MUST contain at least one comma.
    // Guards against a refactor that drops the `.toLocaleString()`
    // call and renders a raw 4-digit number like "4500".
    if (GAMES.length >= 1000) {
      expect(expected).toContain(",");
    }
  });
});
