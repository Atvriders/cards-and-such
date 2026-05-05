import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1918: StatsPage's responsive card grid is rendered as a `<section>` whose
 * `className` is exactly the single token "stats-card-grid" — nothing else.
 * W1235 already pins that the wrapper is a SECTION and that
 * `classList.contains("stats-card-grid")` is true, but it tolerates extra
 * classes being added (e.g. "stats-card-grid stats-card-grid--compact" or
 * a state class like "is-loading"). Multiple downstream CSS rules and the
 * W451 layout sanity test target the bare `.stats-card-grid` selector and
 * assume the element carries no other classes that could shift specificity
 * or trip future style-cascade refactors. Pin the EXACT className equality
 * so a regression that quietly appends a second class is caught.
 */
describe("StatsPage stats-card-grid — exact className equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1918: card-grid <section> className equals exactly 'stats-card-grid'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const activity = screen.getByTestId("stats-activity");
    const grid = activity.parentElement;
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("SECTION");
    // Exact-equality pin — distinct from W1235's classList.contains check.
    expect(grid!.className).toBe("stats-card-grid");
  });
});
