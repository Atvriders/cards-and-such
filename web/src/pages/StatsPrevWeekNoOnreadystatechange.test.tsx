import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onreadystatechange` attribute is a legacy
 * inline event handler historically associated with XMLHttpRequest and, in
 * some browsers, with document/script readiness transitions. It has no defined
 * meaning on a <ul> and, if attached as an HTML attribute, would be parsed as
 * an inline event handler string — a vector for accidental script execution
 * and a clear sign of contamination from copy-pasted XHR code. Sibling tests
 * pin the absence of many other event handlers and global attributes on this
 * list; this test pins the absence of `onreadystatechange` so any future
 * change that attaches it is reviewed deliberately rather than slipping in.
 */
describe("StatsPage stats-prev-week ul — onreadystatechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onreadystatechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onreadystatechange")).toBe(false);
    expect(ul.getAttribute("onreadystatechange")).toBeNull();
  });
});
