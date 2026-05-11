import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `ondeviceorientation` attribute on StatsPage's
 * prior-week breakdown list (data-testid="stats-prev-week"). The
 * `ondeviceorientation` event handler is only meaningful on <body>/<Window>
 * and would be inert here, but leaving it present could mislead future
 * refactors or be flagged by security scanners as an inline event handler.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>.
 */
describe("StatsPage stats-prev-week ul — ondeviceorientation attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ondeviceorientation attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("ondeviceorientation")).toBe(false);
    expect(ul.getAttribute("ondeviceorientation")).toBeNull();
  });
});
