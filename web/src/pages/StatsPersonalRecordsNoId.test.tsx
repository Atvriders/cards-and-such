import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2022: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records"), which wraps the per-game best-times
 * top-10 list, is currently rendered WITHOUT an `id` attribute. Sibling tests
 * pin a number of adjacent contracts on this same node:
 *   - W1809 pins the framing subtitle paragraph tagName.
 *   - W1933 pins the framing subtitle paragraph className equality.
 *   - W1145 pins the empty-state copy when cards-best-times is missing.
 *   - W768 / W786 pin the ascending-time row order and the cap-at-10 cutoff.
 *   - W1308 pins the per-row stats-pr-rank span class/text.
 * However, no existing test pins the absence of an `id` attribute on the
 * stats-personal-records card element itself. Adding an `id` would create a
 * stable in-page anchor / DOM-query handle (e.g. for fragment links,
 * ScrollSpy targets, label-for relationships, or external scripts) that
 * downstream code could silently come to depend on, turning later removal
 * into a hidden breaking change. The current design routes all addressing
 * through `data-testid` (for tests) and class hooks (for styling) so the
 * card's identity stays decoupled from any in-page anchor contract. Pin
 * the absence of an `id` so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-personal-records card — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2022: stats-personal-records card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
