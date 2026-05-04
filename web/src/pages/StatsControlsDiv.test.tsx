import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1452: StatsPage's `.stats-controls` wrapper (data-testid="stats-controls")
 * groups the top category-filter chip row above the card grid. It is
 * implemented as a plain `<div>` element, not a semantic landmark
 * (`<nav>`, `<section>`, `<aside>`). The inner `.lobby-chips` already
 * carries `role="tablist"` and `aria-label="Filter by category"`, so the
 * outer wrapper's tag is the load-bearing structural attribute here.
 * No existing test pins the element TYPE of the `.stats-controls` div —
 * a refactor that promotes it to `<nav>` would silently add a navigation
 * landmark to the page. Lock the current `<div>` implementation here.
 */
describe("StatsPage stats-controls wrapper element type", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1452: stats-controls wrapper is a DIV element (no implicit landmark role)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const controls = screen.getByTestId("stats-controls");
    expect(controls).not.toBeNull();
    expect(controls.classList.contains("stats-controls")).toBe(true);
    // Pin the element type so a swap to <nav>/<section>/etc. is caught.
    expect(controls.tagName).toBe("DIV");
  });
});
