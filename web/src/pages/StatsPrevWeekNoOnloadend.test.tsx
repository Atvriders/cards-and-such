import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onloadend` content attribute is only
 * meaningful on elements that fire a `loadend` event (e.g. XHR, FileReader,
 * media elements via their JS interfaces); on a <ul> it has no defined
 * semantics. Leaving an `onloadend` attribute on this presentational list
 * would still be exposed via DOM serialization and could be interpreted as
 * an inline event handler by future tooling or refactors. Sibling tests pin
 * the absence of many attributes on this <ul>; this test pins the absence
 * of `onloadend` so any future change that accidentally attaches one is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onloadend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onloadend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onloadend")).toBe(false);
    expect(ul.getAttribute("onloadend")).toBeNull();
  });
});
