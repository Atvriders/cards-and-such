import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onpointerlockchange` attribute on StatsPage's
 * prior-week breakdown list (data-testid="stats-prev-week"). The
 * `onpointerlockchange` IDL attribute belongs on Document, not on a
 * presentational <ul>. Adding it inline would do nothing useful and would
 * only introduce surprising serialized HTML. This guard ensures any
 * future refactor that tries to attach a pointer-lock-change handler to
 * this list is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onpointerlockchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpointerlockchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onpointerlockchange")).toBe(false);
    expect(ul.getAttribute("onpointerlockchange")).toBeNull();
  });
});
