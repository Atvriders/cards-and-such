import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onbeforematchchanged` attribute on the
 * StatsPage current-week breakdown list (data-testid="stats-this-week-list").
 * `onbeforematchchanged` is not a defined HTML event handler attribute and
 * carries no meaningful behavior on a presentational <ul>. Pinning its
 * absence ensures any future change that accidentally attaches such an
 * attribute to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforematchchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforematchchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforematchchanged")).toBe(false);
    expect(ul.getAttribute("onbeforematchchanged")).toBeNull();
  });
});
