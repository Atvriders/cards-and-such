import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onaudiostart` attribute on the StatsPage
 * prior-week breakdown list (data-testid="stats-prev-week"). The
 * `onaudiostart` IDL attribute is associated with the SpeechRecognition
 * API and has no meaningful role on a presentational <ul>. Pinning its
 * absence here ensures any future change that accidentally attaches an
 * inline `onaudiostart` handler to this list is reviewed deliberately
 * rather than slipping in unnoticed alongside the other attribute-absence
 * pins on this element.
 */
describe("StatsPage stats-prev-week ul — onaudiostart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onaudiostart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onaudiostart")).toBe(false);
    expect(ul.getAttribute("onaudiostart")).toBeNull();
  });
});
