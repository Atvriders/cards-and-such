import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1780: StatsPage's `stats-this-week` card renders TWO sibling
 * <ul.stats-week-list> elements as direct children of the card body — the
 * current-week list (testid `stats-this-week-list`, no BEM modifier) and the
 * prev-week list (testid `stats-prev-week`, with `--prev` modifier). The
 * paired-list layout is what makes the card a comparison view: current
 * metrics on top, baseline metrics below.
 *
 * Existing tests pin each list's testid, tagName, classes, row counts, and
 * per-row label/value markup independently — but none pin the cardinality
 * of <ul> elements inside the card. A regression that accidentally
 * (a) wrapped the prev-week rows into a third nested <ul>, (b) merged the
 * two lists into one, or (c) duplicated either list, would still satisfy
 * every existing per-list assertion (each testid still resolves to one ul)
 * while silently breaking the paired-list comparison contract. Pinning the
 * count to exactly 2 catches those structural regressions.
 */
describe("StatsPage stats-this-week — ul cardinality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1780: stats-this-week card contains exactly two <ul> elements (current + prev)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const uls = card.querySelectorAll("ul");
    // Exactly two: current-week + prev-week. Not 1 (lists merged), not 3+
    // (extra/nested list), not 0 (lists swapped for div/dl/table).
    expect(uls.length).toBe(2);
  });
});
