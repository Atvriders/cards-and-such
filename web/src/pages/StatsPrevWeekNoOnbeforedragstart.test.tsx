import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onbeforedragstart` attribute is a legacy
 * IE-era event handler attribute that has no standard semantics in modern
 * browsers and is not part of the HTML Living Standard. If it were present
 * on this presentational summary list, browsers that still honor it could
 * attempt to invoke inline script content as an event handler, which would
 * be both a security and a semantics concern. Sibling tests pin the absence
 * of many other attributes on this <ul>; this test pins the absence of
 * `onbeforedragstart` so any future change that accidentally attaches it is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforedragstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforedragstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforedragstart")).toBe(false);
    expect(ul.getAttribute("onbeforedragstart")).toBeNull();
  });
});
