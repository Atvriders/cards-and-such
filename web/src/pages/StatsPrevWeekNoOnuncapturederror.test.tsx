import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onuncapturederror` attribute on the StatsPage
 * prior-week breakdown list (data-testid="stats-prev-week"). The
 * `onuncapturederror` IDL attribute is a global event handler that, if
 * present as a content attribute, would register an inline event handler
 * for uncaptured promise/error events. The presentational <ul> for the
 * previous-week stats summary has no business attaching any inline error
 * handler. Pinning its absence here ensures any future change that would
 * accidentally attach an inline `onuncapturederror` handler to this list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onuncapturederror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onuncapturederror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onuncapturederror")).toBe(false);
    expect(ul.getAttribute("onuncapturederror")).toBeNull();
  });
});
