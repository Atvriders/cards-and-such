import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1390: StatsPage's `.stats-page-head` wrapper renders the page-level
 * `<h1>Your stats</h1>` as its `firstElementChild`, before the
 * `.stats-export-actions` button cluster. The flex-row layout reads
 * left-to-right: title on the left, export buttons on the right. W823
 * pins the h1 text, W931 pins the sibling pairing inside the wrapper,
 * and W1269 pins the wrapper element type — but none pin the ORDER.
 * A refactor that swaps the children (actions first, h1 second) would
 * silently flip the visual hierarchy without any existing test failing.
 * Lock the h1's position as the wrapper's first child so the
 * title-then-actions reading order cannot drift.
 */
describe("StatsPage header — h1 ordering inside stats-page-head", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1390: h1 'Your stats' is firstElementChild of stats-page-head wrapper", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    const head = heading.parentElement;
    expect(head).not.toBeNull();
    expect(head?.classList.contains("stats-page-head")).toBe(true);
    // Pin the heading as the wrapper's first child so a refactor that
    // moves the export-actions cluster ahead of the title is caught.
    expect(head?.firstElementChild).toBe(heading);
  });
});
