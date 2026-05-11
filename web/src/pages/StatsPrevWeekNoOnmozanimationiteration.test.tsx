import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onmozanimationiteration` attribute is a
 * legacy Mozilla-prefixed inline event handler for CSS animation iteration
 * events; assigning it would register a script handler on the element. This
 * presentational list never plays a CSS animation that needs per-iteration
 * scripting, and inline event-handler attributes bypass our normal React
 * event delegation, making them harder to audit and a CSP risk. Sibling
 * tests pin the absence of many global/event-handler attributes on this
 * <ul>; this test extends that coverage to `onmozanimationiteration` so any
 * future change that accidentally attaches one is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onmozanimationiteration attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmozanimationiteration attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozanimationiteration")).toBe(false);
    expect(ul.getAttribute("onmozanimationiteration")).toBeNull();
  });
});
