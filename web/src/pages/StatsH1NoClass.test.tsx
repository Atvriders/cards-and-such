import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1570: StatsPage's page-level `<h1>Your stats</h1>` is rendered as a bare
 * heading with NO `className` — it intentionally leans on the global h1
 * typography stack rather than a page-specific override. W823 pins the
 * text, W1390 pins it as `.stats-page-head`'s firstElementChild, and the
 * existing `tagName === "H1"` check pins the level — but none of them
 * pin the absence of a className. A refactor that adds e.g.
 * `className="stats-title"` (to scope a one-off font size) would
 * silently introduce a new style hook that the global h1 rules don't
 * know about, drifting the visual hierarchy from every other page-level
 * h1 in the app. Lock the bare-className contract so the heading keeps
 * inheriting the same global h1 styling everyone else uses.
 */
describe("StatsPage header — h1 has no className override", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1570: page-level h1 'Your stats' renders with empty className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    expect(heading.tagName).toBe("H1");
    // Pin the bare-className contract: the heading must not carry a
    // page-specific class, so it keeps inheriting the global h1 styles.
    expect(heading.className).toBe("");
    expect(heading.classList.length).toBe(0);
  });
});
