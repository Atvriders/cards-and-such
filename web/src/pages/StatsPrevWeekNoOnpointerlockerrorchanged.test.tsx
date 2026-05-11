import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onpointerlockerrorchanged` attribute is not
 * a defined HTML attribute or standard event handler on <ul>, and leaving it
 * present would expose an unexpected inline handler hook via DOM
 * serialization. Sibling tests pin the absence of many other attributes on
 * this element; this test pins the absence of `onpointerlockerrorchanged` so
 * that any future change accidentally attaching such a handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointerlockerrorchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpointerlockerrorchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockerrorchanged")).toBe(false);
    expect(ul.getAttribute("onpointerlockerrorchanged")).toBeNull();
  });
});
