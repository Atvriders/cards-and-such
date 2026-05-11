import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3214: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpointermove` content attribute
 * would, if present, register an inline JavaScript handler invoked whenever a
 * pointer moves across the element. Such inline event handlers are a classic
 * XSS vector, fire on every pointer movement (a performance concern), and have
 * no place on a static presentational summary list. Sibling tests pin the
 * absence of many other inline pointer/mouse/keyboard handlers on this <ul>,
 * but none pin the absence of `onpointermove`. Pinning it here ensures any
 * future change that accidentally attaches an inline `onpointermove` handler
 * to this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointermove attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3214: stats-prev-week ul has no onpointermove attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointermove")).toBe(false);
    expect(ul.getAttribute("onpointermove")).toBeNull();
  });
});
