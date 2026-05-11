import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * presentational <ul>. `onmotion` is not a defined HTML event handler
 * attribute, but pinning its absence guards against any future refactor or
 * tooling accidentally attaching it to this element where it would carry no
 * semantics yet still appear in DOM serialization.
 */
describe("StatsPage stats-prev-week ul — onmotion attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmotion attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmotion")).toBe(false);
    expect(ul.getAttribute("onmotion")).toBeNull();
  });
});
