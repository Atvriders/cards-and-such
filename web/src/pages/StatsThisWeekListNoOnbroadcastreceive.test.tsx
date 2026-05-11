import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbroadcastreceive` attribute is not a defined HTML event handler attribute
 * on any standard element and carries no meaningful semantics on a <ul>.
 * Leaving it present would still be exposed via DOM serialization and could
 * mislead future refactors or tooling that try to interpret it as an event
 * handler hook. Pinning its absence here ensures any future change that
 * accidentally attaches an `onbroadcastreceive` attribute to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbroadcastreceive attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbroadcastreceive attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbroadcastreceive")).toBe(false);
    expect(ul.getAttribute("onbroadcastreceive")).toBeNull();
  });
});
