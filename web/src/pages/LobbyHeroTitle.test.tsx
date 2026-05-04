import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1202 — the lobby hero block renders a single page-level <h1>
 * containing the brand title "Cards and Such". This h1 is the first
 * landmark heading screen readers and search engines latch onto when
 * the lobby loads, so it must remain present, role-correct, and copy-
 * stable across refactors of the hero header.
 *
 * Why this needs its own pin:
 *  - Sibling lobby tests (LobbyHeroTotalCount, LobbyHeroStatsAria)
 *    cover the subtitle and stats row, but none assert the h1 itself.
 *    A regression that demotes the title to <h2>, swaps it for a div,
 *    or renames the brand copy would slip through silently and harm
 *    SEO + a11y simultaneously.
 *  - The title text lives inside a nested <span class="lobby-hero-title">
 *    purely for gradient styling — `getByRole("heading", { level: 1 })`
 *    plus `.textContent` validates BOTH the semantic level and the
 *    visible copy in one assertion.
 */
describe("LobbyPage — hero h1 title (W1202)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders an h1 heading with text 'Cards and Such'", () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = getByRole("heading", { level: 1 });
    expect(h1.tagName).toBe("H1");
    expect(h1.textContent).toBe("Cards and Such");
  });
});
