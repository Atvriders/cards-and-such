import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `oncontextrestored` attribute is a window-level
 * event handler reflected as a global IDL attribute; placing it directly on a
 * presentational <ul> would attach inline JavaScript that runs when a document
 * is restored from the back/forward cache. Sibling tests pin the absence of
 * various global, ARIA, and event-handler attributes on this element. Pinning
 * the absence of `oncontextrestored` ensures any future change that
 * accidentally wires an inline contextrestored handler onto this summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncontextrestored attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no oncontextrestored attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncontextrestored")).toBe(false);
    expect(ul.getAttribute("oncontextrestored")).toBeNull();
  });
});
