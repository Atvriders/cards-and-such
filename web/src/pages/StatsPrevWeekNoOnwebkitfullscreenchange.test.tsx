import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * plain presentational <ul>. The `onwebkitfullscreenchange` IDL attribute is
 * a WebKit-specific event handler for fullscreen state transitions and has
 * no meaning on a static <ul>. Pinning its absence ensures any future change
 * that accidentally attaches a WebKit fullscreen event handler to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onwebkitfullscreenchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onwebkitfullscreenchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onwebkitfullscreenchange")).toBe(false);
    expect(ul.getAttribute("onwebkitfullscreenchange")).toBeNull();
  });
});
