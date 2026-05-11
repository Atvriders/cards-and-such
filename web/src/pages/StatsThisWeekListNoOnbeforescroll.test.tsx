import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onbeforescroll` attribute on the
 * stats-this-week-list <ul>. `onbeforescroll` is not a standard HTML
 * event-handler content attribute, and the weekly breakdown list is a
 * purely presentational summary that does not need to intercept scroll
 * events. Pinning its absence ensures any future change that accidentally
 * attaches an `onbeforescroll` handler (which would execute arbitrary
 * inline script if a browser ever honored it) is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforescroll attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforescroll attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforescroll")).toBe(false);
    expect(ul.getAttribute("onbeforescroll")).toBeNull();
  });
});
