import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `ondevicestart` attribute on the
 * `stats-this-week-list` <ul>. `ondevicestart` is not a standard HTML or
 * DOM event attribute and carries no defined behavior on a presentational
 * <ul>. Pinning its absence ensures any future change that accidentally
 * attaches such an inline handler-like attribute to this weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondevicestart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ondevicestart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondevicestart")).toBe(false);
    expect(ul.getAttribute("ondevicestart")).toBeNull();
  });
});
