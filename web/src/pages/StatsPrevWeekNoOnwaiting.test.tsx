import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onwaiting` attribute is an
 * inline event handler for the HTMLMediaElement `waiting` event and is only
 * meaningful on <audio> and <video> elements. On a <ul> it carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead crawlers, assistive technology, or future
 * refactors that try to interpret it as an executable handler. Pinning its
 * absence here ensures any future change that accidentally attaches an
 * `onwaiting` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onwaiting attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onwaiting attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwaiting")).toBe(false);
    expect(ul.getAttribute("onwaiting")).toBeNull();
  });
});
