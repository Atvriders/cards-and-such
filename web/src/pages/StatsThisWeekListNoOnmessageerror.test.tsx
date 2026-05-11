import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onmessageerror` attribute is an inline event handler associated with
 * Worker, BroadcastChannel, and MessagePort message-deserialization failures;
 * it has no defined behavior on a <ul>. Allowing such an inline handler to
 * land on this presentational list would attach executable JavaScript via a
 * DOM attribute, bypassing the project's normal event-binding patterns and
 * any CSP that forbids inline handlers, while also confusing assistive tech,
 * crawlers, and future refactors. Pinning its absence ensures any future
 * change that accidentally attaches an `onmessageerror` handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmessageerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmessageerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmessageerror")).toBe(false);
    expect(ul.getAttribute("onmessageerror")).toBeNull();
  });
});
