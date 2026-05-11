import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. The `onvolumechange` content attribute is an
 * event handler attribute intended for media elements (<audio>, <video>); on
 * a presentational <ul> it carries no defined semantics. Pinning its absence
 * here ensures any future change that accidentally attaches an
 * `onvolumechange` handler attribute to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onvolumechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onvolumechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onvolumechange")).toBe(false);
    expect(ul.getAttribute("onvolumechange")).toBeNull();
  });
});
