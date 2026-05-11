import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onsearchchanged` attribute on the StatsPage
 * current-week breakdown list (data-testid="stats-this-week-list"). The
 * `onsearchchanged` name is not a standard HTML inline event handler; if it
 * ever appeared on this presentational <ul>, it would either be silently
 * ignored by the browser or, worse, treated as a custom data hook that future
 * code could begin to rely on. This test ensures any deliberate addition of
 * such an attribute is reviewed rather than introduced silently alongside
 * other refactors.
 */
describe("StatsPage stats-this-week-list ul — onsearchchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsearchchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsearchchanged")).toBe(false);
    expect(ul.getAttribute("onsearchchanged")).toBeNull();
  });
});
