import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3212: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointerup` attribute, when written as an HTML attribute, registers an
 * inline pointer-event handler whose string value is parsed and executed as
 * JavaScript when the user releases a pointer (mouse, touch, or stylus) over
 * the element. Placing such a handler on this purely presentational summary
 * list would attach unintended interactive behaviour to a non-interactive
 * region, break content-security-policy postures that forbid inline event
 * handlers, and provide a vector for accidental script injection if any of
 * the weekly stats content ever flows into the attribute value. A broad
 * family of pointer-event attribute absences is already pinned on sibling
 * and related elements, but no test currently pins `onpointerup` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onpointerup` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3212: stats-this-week-list ul has no onpointerup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerup")).toBe(false);
    expect(ul.getAttribute("onpointerup")).toBeNull();
  });
});
