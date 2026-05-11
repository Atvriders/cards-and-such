import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `onnavigateerror` attribute on the
 * `stats-this-week-list` <ul>. `onnavigateerror` is an event handler content
 * attribute associated with the Navigation API's `Window`/`Navigation`
 * interfaces; it has no defined meaning on a <ul> and would simply be
 * serialized as an inline string attribute. Pinning its absence here ensures
 * any future change that accidentally attaches an `onnavigateerror` handler
 * to this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onnavigateerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onnavigateerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnavigateerror")).toBe(false);
    expect(ul.getAttribute("onnavigateerror")).toBeNull();
  });
});
