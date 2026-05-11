import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onpresentationdisconnect` inline event-handler
 * attribute on StatsPage's prior-week breakdown list
 * (data-testid="stats-prev-week"). The Presentation API
 * `onpresentationdisconnect` handler is only meaningful on
 * `PresentationConnection` / `PresentationRequest` objects in JavaScript and
 * has no defined behaviour as an HTML attribute on a presentational <ul>.
 * Allowing it to appear in the DOM would inject executable inline script,
 * bypass CSP `script-src` policies, and silently couple this list to a
 * browser API that has nothing to do with weekly statistics. Sibling tests
 * pin the absence of many other event-handler and global attributes; this
 * test ensures any future change that accidentally attaches an
 * `onpresentationdisconnect` handler to this <ul> is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpresentationdisconnect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpresentationdisconnect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpresentationdisconnect")).toBe(false);
    expect(ul.getAttribute("onpresentationdisconnect")).toBeNull();
  });
});
