import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `ondurationchange` IDL attribute is a media
 * event handler that only carries semantics on media elements such as
 * <audio> and <video>; on a presentational <ul> it has no defined meaning.
 * Allowing it to be set inline would still expose an executable event handler
 * via DOM serialization and could be abused as an XSS sink or mislead future
 * refactors. This test pins its absence so any change that accidentally
 * attaches an `ondurationchange` handler to this summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondurationchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ondurationchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondurationchange")).toBe(false);
    expect(ul.getAttribute("ondurationchange")).toBeNull();
  });
});
