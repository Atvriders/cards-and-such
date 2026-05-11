import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the non-standard `onbeforeblur` attribute on the
 * stats-this-week-list <ul>. `onbeforeblur` is not a defined HTML event
 * handler attribute, but if it were ever serialized onto the element it
 * could be misinterpreted by tooling or future refactors. This test
 * guarantees the presentational weekly summary list stays free of it.
 */
describe("StatsPage stats-this-week-list ul — onbeforeblur attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforeblur attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.hasAttribute("onbeforeblur")).toBe(false);
    expect(ul.getAttribute("onbeforeblur")).toBeNull();
  });
});
