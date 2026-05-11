import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onnavigateerror` attribute corresponds to
 * the Navigation API's `navigateerror` event handler, which is only
 * meaningful on the global `window` (or `Navigation` interface) and has no
 * defined semantics as an inline HTML attribute on a <ul>. Pinning its
 * absence here ensures any future change that accidentally attaches an
 * `onnavigateerror` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onnavigateerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onnavigateerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnavigateerror")).toBe(false);
    expect(ul.getAttribute("onnavigateerror")).toBeNull();
  });
});
