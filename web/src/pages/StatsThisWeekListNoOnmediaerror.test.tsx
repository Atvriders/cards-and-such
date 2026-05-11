import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onmediaerror` attribute is an inline event handler that, if present, would
 * cause the browser to compile its value as JavaScript and execute it when a
 * media error event fires. A presentational weekly summary <ul> has no media
 * children and no legitimate need for any inline event handler, let alone
 * `onmediaerror`. Pinning its absence here ensures any future change that
 * accidentally attaches an inline `onmediaerror` handler to this list — which
 * would be both dead code and a latent XSS sink if the attribute value ever
 * derived from user-influenced data — is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmediaerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmediaerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmediaerror")).toBe(false);
    expect(ul.getAttribute("onmediaerror")).toBeNull();
  });
});
