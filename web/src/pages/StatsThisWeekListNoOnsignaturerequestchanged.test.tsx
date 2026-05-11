import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onsignaturerequestchanged` attribute is not a standard HTML event handler
 * attribute and has no defined behavior on a <ul>. Were it ever to leak onto
 * this presentational weekly summary list, it would still be exposed via DOM
 * serialization and could confuse assistive technology, crawlers, or future
 * refactors that try to interpret it as a real event handler. Pinning its
 * absence here ensures any future change that accidentally attaches it to
 * this element is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsignaturerequestchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsignaturerequestchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsignaturerequestchanged")).toBe(false);
    expect(ul.getAttribute("onsignaturerequestchanged")).toBeNull();
  });
});
