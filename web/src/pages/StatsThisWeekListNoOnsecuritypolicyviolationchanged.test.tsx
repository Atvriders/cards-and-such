import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin absence of the `onsecuritypolicyviolationchanged` attribute on the
 * stats-this-week-list <ul>. This is not a defined global event handler
 * content attribute (the standard event is `securitypolicyviolation`, exposed
 * via `onsecuritypolicyviolation`). Leaving a misspelled or speculative
 * handler attribute on a presentational list would have no effect at runtime
 * but would still appear in DOM serialization and could mislead future
 * refactors, audits, or assistive tooling. Pinning its absence ensures any
 * future change that accidentally attaches such an attribute to this weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsecuritypolicyviolationchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsecuritypolicyviolationchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsecuritypolicyviolationchanged")).toBe(false);
    expect(ul.getAttribute("onsecuritypolicyviolationchanged")).toBeNull();
  });
});
