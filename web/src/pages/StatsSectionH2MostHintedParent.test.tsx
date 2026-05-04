import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1488: The "Most-hinted games" h2 is the section heading of the
 * most-hinted stats card. Existing tests pin (a) the heading text + level
 * via getByRole (W854) and (b) the row-level child classNames such as
 * `stats-most-hinted-rank` (W1383), `stats-most-hinted-title` (W1394),
 * and `stats-most-hinted-count` (W1405) — but NOTHING pins the structural
 * relationship between the h2 and its containing panel — i.e. the h2 must
 * sit directly inside the `<div class="stats-card"
 * data-testid="stats-most-hinted">` card. A refactor that pulls the h2
 * out of the panel (e.g. hoists it above the card) or strips the
 * `stats-card` className from the heading's parent would silently break
 * the panel's visual hierarchy while every existing assertion still
 * passes. Pin the h2's parent classList + data-testid so that contract is
 * enforced.
 */
describe("StatsPage Most-hinted section — h2 parent panel relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1488: 'Most-hinted games' h2 is nested inside the .stats-card div with data-testid='stats-most-hinted'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Most-hinted games" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the Most-hinted stats-card panel.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-most-hinted");
  });
});
