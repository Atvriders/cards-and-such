import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1263: The "Activity" h2 is the section heading of the Activity stats
 * card. Existing tests pin (a) the heading text + level via getByRole
 * (W828/W833 audit) and (b) the outer `.stats-card-grid` SECTION wrapper
 * (W1235), but NOTHING pins the structural relationship between the h2
 * and its containing card — i.e. the h2 must sit directly inside the
 * `<div class="stats-card" data-testid="stats-activity">` card. A
 * refactor that pulls the h2 out of the card (e.g. hoists it to the
 * grid wrapper) or strips the `stats-card` className from the heading's
 * parent would silently break the card's visual hierarchy while every
 * existing assertion still passes. Pin the h2's parent classList +
 * data-testid so that contract is enforced.
 */
describe("StatsPage Activity section — h2 parent card relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1263: 'Activity' h2 is nested inside the .stats-card div with data-testid='stats-activity'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Activity" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the Activity stats-card.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-activity");
  });
});
