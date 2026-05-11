import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `oncuechangechanged` attribute is not a defined HTML event handler attribute
 * — the real media-cue event is `oncuechange`, which only applies to
 * <track> elements. An `oncuechangechanged` attribute on a <ul> carries no
 * semantics, would not wire up any event, and could mislead future readers or
 * tooling that scan for inline event handlers. Pinning its absence here keeps
 * the presentational weekly summary list free of spurious event-handler-like
 * attributes and ensures any accidental addition is reviewed deliberately.
 */
describe("StatsPage stats-this-week-list ul — oncuechangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no oncuechangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncuechangechanged")).toBe(false);
    expect(ul.getAttribute("oncuechangechanged")).toBeNull();
  });
});
