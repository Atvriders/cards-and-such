import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `onsignaturerequestchanged` attribute on the
 * StatsPage prior-week breakdown list (data-testid="stats-prev-week").
 * `onsignaturerequestchanged` is not a standard HTML event handler attribute
 * and has no defined semantics on a <ul>. Pinning its absence ensures that
 * any future change which accidentally attaches such an attribute to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsignaturerequestchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onsignaturerequestchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onsignaturerequestchanged")).toBe(false);
    expect(ul.getAttribute("onsignaturerequestchanged")).toBeNull();
  });
});
