import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onpopover` attribute is not a standard HTML
 * event handler attribute; valid popover-related handlers are
 * `ontoggle`/`onbeforetoggle` on popover targets. Leaving a stray `onpopover`
 * attribute on this presentational <ul> would have no defined effect but
 * could mislead future refactors or static analyzers into treating the
 * element as popover-related. This test pins the absence of `onpopover` so
 * any accidental addition is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onpopover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpopover attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onpopover")).toBe(false);
    expect(ul.getAttribute("onpopover")).toBeNull();
  });
});
