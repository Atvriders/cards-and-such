import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1768: StatsPage's `stats-this-week` card renders its CURRENT-week metric
 * list as `<ul className="stats-week-list" data-testid="stats-this-week-list">`
 * — with NO BEM modifier suffix. The sibling prev-week list reuses the same
 * base class plus a `--prev` modifier (W1592 pins that). The asymmetry — base
 * class alone on this-week, base + `--prev` on prev-week — is what lets the
 * CSS dim / tone the prior block while keeping the current block at full
 * emphasis.
 *
 * Existing tests pin the base `stats-week-list` className via toHaveClass()
 * (W1361) which is a partial match — a regression that accidentally appended
 * `stats-week-list--prev` (or any other modifier) to the current-week <ul>
 * would silently swap the visual emphasis of the two lists while leaving
 * W1361 green. This test pins the exact className string so the current-week
 * list stays modifier-free.
 */
describe("StatsPage stats-this-week — current-week list exact className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1768: stats-this-week-list <ul> className is exactly 'stats-week-list' with no BEM modifier", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.className).toBe("stats-week-list");
    // And explicitly: it must NOT carry the prev-week modifier the sibling
    // <ul data-testid="stats-prev-week"> uses to dim its block.
    expect(list.classList.contains("stats-week-list--prev")).toBe(false);
  });
});
