import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. The `onpointerrawupdate` content attribute
 * corresponds to the high-frequency pointer event handler used to capture
 * un-coalesced pointermove samples. It has no place on a presentational
 * summary list: attaching one would either silently no-op (as an unknown
 * attribute) or, if interpreted by future tooling, register an unintended
 * event listener via attribute reflection. Pinning its absence here ensures
 * any future change that accidentally attaches an `onpointerrawupdate`
 * attribute to this <ul> is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointerrawupdate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpointerrawupdate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerrawupdate")).toBe(false);
    expect(ul.getAttribute("onpointerrawupdate")).toBeNull();
  });
});
