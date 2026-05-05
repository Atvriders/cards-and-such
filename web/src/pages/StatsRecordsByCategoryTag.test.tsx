import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1954: The "Personal records by category" stats card is rendered as a
 * plain <div> container carrying the `stats-card` className and the
 * `data-testid="stats-personal-records-by-category"` hook. Existing
 * coverage pins the card's subtitle (W1296), the by-cat list's modifier
 * class (W1333), the one-PR-per-category row mapping (W635), and the
 * h2 → parent-card structural relationship (W1464) — but nothing
 * pins the container's element type. A refactor that swaps the
 * container to a <section>, <article>, or other landmark element would
 * silently change the page's accessibility tree (introducing an extra
 * sectioning landmark in the stats-card grid) while every existing
 * assertion continues to pass. Pin the tagName so the contract is
 * enforced.
 */
describe("StatsPage — personal records by category container tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1954: stats-personal-records-by-category card container is a <div>", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");
    expect(card.tagName).toBe("DIV");
  });
});
