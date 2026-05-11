import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `onsignaturerequestabort` attribute on the
 * StatsPage prior-week breakdown list (data-testid="stats-prev-week").
 *
 * `onsignaturerequestabort` is an event-handler content attribute associated
 * with the Digital Credentials / signature request lifecycle. It has no
 * defined semantics on a presentational <ul> and, if present, would attach
 * inline script handling to a list that intentionally carries no behavior.
 * Sibling tests pin the absence of many global and ARIA attributes on this
 * element; this test extends that contract to `onsignaturerequestabort` so
 * any future change that accidentally attaches such a handler to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsignaturerequestabort attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onsignaturerequestabort attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onsignaturerequestabort")).toBe(false);
    expect(ul.getAttribute("onsignaturerequestabort")).toBeNull();
  });
});
